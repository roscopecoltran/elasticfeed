package router

import (
	"github.com/feedlabs/feedify"
	"github.com/feedlabs/elasticfeed/stream/controller"
)

func init() {
	feedify.SetStaticPath("/static", "stream/static")

	feedify.Router("/lp/join", &controller.LongPollingController{}, "get:Join")
	feedify.Router("/lp/post", &controller.LongPollingController{})
	feedify.Router("/lp/fetch", &controller.LongPollingController{}, "get:Fetch")

	feedify.Router("/ws/join", &controller.WebSocketController{}, "get:Join")
}
