package routers

import (
	"github.com/feedlabs/feedify/lib/api/controllers"
	"github.com/astaxie/beego"
)

func init() {
	beego.Router("/v1/feed", &controllers.FeedController{}, "get:Get;post:Post")
	beego.Router("/v1/feed/:feedId:int", &controllers.FeedController{}, "get:Get;delete:Delete;put:Put")

	beego.Router("/v1/feed/:feedId:int/entry", &controllers.FeedEntryController{}, "get:Get;post:Post")
	beego.Router("/v1/feed/:feedId:int/entry/:feedEntryId:int", &controllers.FeedEntryController{}, "get:Get;delete:Delete;put:Put")
}
