package firebase

import (
	"context"
	"fmt"
	"sort"

	"cloud.google.com/go/firestore"
	"github.com/ansel1/merry/v2"
	"google.golang.org/api/iterator"
)

// PollResponse captures the data about the poll answers
type PollResponse struct {
	PersonAge int      `firestore:"personAge"`
	PersonID  int      `firestore:"personId"`
	Question  string   `firestore:"question"`
	Selected  []string `firestore:"selected"`
	ChurchID  int      `firestore:"churchId"`
}

// PollQuestion represents a FB poll question
type PollQuestion struct {
	CanChangeAnswer bool           `firestroe:"canChangeAnswer"`
	ID              string         `firestroe:"id"`
	Initialized     bool           `firestroe:"initialized"`
	Order           int            `firestroe:"order"`
	Texts           TranslatedText `firestroe:"texts"`
	Type            string         `firestroe:"type"`
}

// PollAnswerData from firebase. This is not a users response, this is the data about the answer itself
type PollAnswerData struct {
	Color   string         `firestroe:"color"`
	Correct bool           `firestroe:"correct"`
	ID      string         `firestroe:"id"`
	Order   int            `firestroe:"order"`
	Texts   TranslatedText `firestroe:"texts"`
}

func getAllResponsesForEvent(ctx context.Context, client *firestore.Client, eventID string) ([]PollResponse, error) {
	if eventID == "" {
		return nil, merry.Errorf("Empty event ID")
	}

	responses := client.Collection(fmt.Sprintf("events/%s/responses", eventID)).Documents(ctx)
	defer responses.Stop()

	out := []PollResponse{}

	for {
		r, err := responses.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		pr := PollResponse{}
		err = r.DataTo(&pr)
		if err != nil {
			return nil, err
		}

		out = append(out, pr)

	}

	return out, nil
}

// AnswerMap between question ID and correct answer IDs
type AnswerMap map[string](map[string]bool)

// GetCorrectAnswersMap returns a map of QuestionID => CorrectAnswerID for quickly validating if
// answers and qustion ID combos are correct.
func GetCorrectAnswersMap(ctx context.Context, client *firestore.Client, eventID string) (AnswerMap, error) {
	if eventID == "" {
		return nil, merry.Errorf("Empty event ID")
	}

	out := AnswerMap{}
	questions := client.Collection(fmt.Sprintf("events/%s/questions", eventID)).Documents(ctx)
	defer questions.Stop()

	for {
		q, err := questions.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		pq := PollQuestion{}
		err = q.DataTo(&pq)
		if err != nil {
			return nil, err
		}

		correctAnswers, err := GetCorrectAnswerID(ctx, client, eventID, pq.ID)
		if err != nil {
			return nil, err
		}

		out[pq.ID] = correctAnswers
	}

	return out, nil
}

// GetCorrectAnswerID for the specified question
func GetCorrectAnswerID(ctx context.Context, client *firestore.Client, eventID, questionID string) (map[string]bool, error) {
	if eventID == "" {
		return nil, merry.Errorf("Empty event ID")
	}

	answers := client.Collection(fmt.Sprintf("events/%s/questions/%s/answers", eventID, questionID)).Documents(ctx)

	correctAnswers := map[string]bool{}

	for {
		a, err := answers.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		pad := PollAnswerData{}
		err = a.DataTo(&pad)
		if err != nil {
			return nil, err
		}

		if pad.Correct {
			correctAnswers[pad.ID] = true
		}
	}

	return correctAnswers, nil
}

// GetAgePercentages returns the percetage of correct answers across all questions in the event
// split at the cutoff.
//
// For example `cutoff` == 18 means that the 1st returned value is the % of correct answers
// for users aged 18 (incl) and below and the 2nd number is for users aged 19 (incl) and above
func GetAgePercentages(ctx context.Context, client *firestore.Client, eventID string, cutoff int) (float64, float64, error) {
	responses, err := getAllResponsesForEvent(ctx, client, eventID)
	if err != nil {
		return -1, -1, err
	}

	answers, err := GetCorrectAnswersMap(ctx, client, eventID)
	if err != nil {
		return -1, -1, err
	}

	totalOver := 0.0
	totalUnder := 0.0
	correctOver := 0.0
	correctUnder := 0.0

	for _, r := range responses {
		if len(r.Selected) != 1 {
			// This stats makes no sense if you can select more than 1 answer
			continue
		}

		if aid, ok := answers[r.Question]; ok {
			if r.PersonAge >= cutoff {
				totalOver++
				if _, ok := aid[r.Selected[0]]; ok {
					correctOver++
				}
			} else {
				totalUnder++
				if _, ok := aid[r.Selected[0]]; ok {
					correctUnder++
				}
			}

		}
	}

	returnUnder := 0.0
	returnOver := 0.0

	if totalOver != 0 {
		returnOver = correctOver / totalOver
	}

	if totalUnder != 0 {
		returnUnder = correctUnder / totalUnder
	}

	return returnUnder, returnOver, nil
}

// WritePollAgeStats into firebase
func WritePollAgeStats(ctx context.Context, client *firestore.Client, eventID string, cutoff int, over, under float64) error {
	data := map[string]interface{}{
		"cutoffAge": cutoff,
		"over":      over,
		"under":     under,
	}
	doc := client.Doc(fmt.Sprintf("events/%s/stats/poll-by-age", eventID))
	_, err := doc.Set(ctx, data)
	err = merry.Wrap(err)
	return err
}

type chruchStats struct {
	Correct   int
	Total     int
	Percetage float64
	ChurchID  int
}

func (s *chruchStats) IncTotal() {
	s.Total++
}

func (s *chruchStats) IncCorrect() {
	s.Correct++
}

func (s *chruchStats) CalculatePercentage() float64 {
	if s.Total == 0 {
		s.Percetage = 0
	} else {
		s.Percetage = float64(s.Correct) / float64(s.Total)
	}
	return s.Percetage
}

func (s chruchStats) ToMap() map[string]interface{} {
	return map[string]interface{}{
		"total":      s.Total,
		"correct":    s.Correct,
		"churchId":   s.ChurchID,
		"percentage": s.Percetage,
	}
}

// GetPollChurchPercentages calculates how many responses were correct by church
func GetPollChurchPercentages(ctx context.Context, client *firestore.Client, eventID string) (map[int]*chruchStats, error) {
	responses, err := getAllResponsesForEvent(ctx, client, eventID)
	if err != nil {
		return nil, err
	}

	answers, err := GetCorrectAnswersMap(ctx, client, eventID)
	if err != nil {
		return nil, err
	}

	stats := map[int]*chruchStats{}

	for _, r := range responses {
		if len(r.Selected) != 1 {
			// This stats makes no sense if you can select more than 1 answer
			continue
		}

		if _, ok := stats[r.ChurchID]; !ok {
			stats[r.ChurchID] = &chruchStats{
				ChurchID: r.ChurchID,
			}
		}
		stats[r.ChurchID].IncTotal()
		if aid, ok := answers[r.Question]; ok {
			if _, ok := aid[r.Selected[0]]; ok {
				stats[r.ChurchID].IncCorrect()
			}
		}
	}

	return stats, nil
}

// WritePollChurchesStats into firebase
func WritePollChurchesStats(ctx context.Context, client *firestore.Client, eventID string, topHowMany int, stats map[int]*chruchStats) error {
	if stats == nil {
		return nil
	}

	toSort := []*chruchStats{}

	for _, s := range stats {
		s.CalculatePercentage()
		toSort = append(toSort, s)
	}

	sort.Slice(toSort, func(i, j int) bool {
		return toSort[i].Percetage > toSort[j].Percetage || (toSort[i].Percetage == toSort[j].Percetage &&
			toSort[i].ChurchID < toSort[j].ChurchID)
	})

	if len(toSort) < topHowMany {
		topHowMany = len(toSort)
	}

	topX := toSort[0:topHowMany]

	asMap := map[string]interface{}{}
	for i, s := range topX {
		asMap[fmt.Sprintf("%d", i)] = s.ToMap()
	}

	doc := client.Doc(fmt.Sprintf("events/%s/stats/poll-by-church", eventID))
	_, err := doc.Set(ctx, asMap)
	err = merry.Wrap(err)
	return err
}
