package population

/*
	IT DESCRIBE PERSON AS ENTITY OF PERSONALITY

	IT HAS:
	- HABITS
	- ACTIONS
	- BEHAVIOURS
	- MOODS
	- PHASES
	- ...
 */

const (
	HUMAN_SEX_FEMALE = 1
	HUMAN_SEX_MALE = 2
)

type HumanController struct {
	sex int
}

func (this *HumanController) GetSex() int {
	return this.sex
}

func (this *HumanController) SetSex(sex int) {
	this.sex = sex
}

func NewHumanController() *HumanController {
	return &HumanController{0}
}
