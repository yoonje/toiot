package processing

import (
	"errors"
	"fmt"

	"github.com/KumKeeHyun/PDK/kafka/elasticPipe"
	"github.com/KumKeeHyun/PDK/kafka/kafkaPipe"
	"github.com/KumKeeHyun/PDK/kafka/wsClient"
)

const BUFSIZE = 1

var valueNames = []string{
	"x",
	"y",
	"z",
}

func ProcessingPipe(in <-chan kafkaPipe.KafkaData) <-chan elasticPipe.ElasticData {
	out := make(chan elasticPipe.ElasticData, BUFSIZE)
	go func() {
		defer func() {
			close(out)
		}()
		for data := range in {
			res, err := DataProcessing(data)
			if err != nil {
				continue
			}
			out <- res
		}
	}()
	return out
}

func DataProcessing(in kafkaPipe.KafkaData) (elasticPipe.ElasticData, error) {
	wsClient.Repo.Mu.RLock()
	defer wsClient.Repo.Mu.RUnlock()

	out := elasticPipe.ElasticData{
		Index: in.Key,
		Doc:   in.Value,
	}

	sensor, ok := wsClient.Repo.Info.SensorInfo[in.Key]
	if !ok {
		s := fmt.Sprintf("not exist sensor %s\n", in.Key)
		return out, errors.New(s)
	}

	values := in.Value["value"].([]interface{})
	newValues := map[string]interface{}{}
	for i, vn := range sensor.ValueList {
		newValues[vn.ValueName] = values[i]
	}
	out.Doc["value"] = newValues

	return out, nil
}