import React from 'react';
import { Meteor } from "meteor/meteor";
import { withTracker } from 'meteor/react-meteor-data';
import SseApp2d from "./2d/SseApp2d";
import SseApp3d from "./3d/SseApp3d";
import $ from "jquery";

class SseEditorApp extends React.Component {

    render() {
        if (!this.props.subReady)
            return null;
        if (this.props.mode == "2d")
            return <SseApp2d imageUrl={this.props.imageUrl} />;
        else if (this.props.mode == "3d")
            return <SseApp3d imageUrl={this.props.imageUrl} />;
        else return null;
    }
}
// withTracker 创建容器组件为一般组件提供数据
export default withTracker((props) => {
    // props 是一个路由有match、location、history的对象
    // {
    //     "match":{
    //         "path":"/edit/:path",
    //         "url":"/edit/%2Fpointcloud_labeling.pcd",
    //         "isExact":true,
    //         "params":{
    //             "path":"%2Fpointcloud_labeling.pcd"
    //         }
    //     },
    //     "location":{
    //         "pathname":"/edit/%2Fpointcloud_labeling.pcd",
    //         "search":"",
    //         "hash":"",
    //         "key":"ectcly"
    //     },
    //     "history":{
    //         "length":16,
    //         "action":"POP",
    //         "location":{
    //             "pathname":"/edit/%2Fpointcloud_labeling.pcd",
    //             "search":"",
    //             "hash":"",
    //             "key":"ectcly"
    //         }
    //     }
    // }
    $("#waiting").removeClass("display-none");
    const imageUrl = "/" + props.match.params.path;
    let subName = "sse-data-descriptor";
    const subscription = Meteor.subscribe(subName, imageUrl);
    Meteor.subscribe("sse-object");
    Meteor.subscribe("sse-layer");
    const subReady = subscription.ready(); // 当这个public 发布是 ready的值为true
    const mode = props.match.params.path.endsWith(".pcd") ? "3d" : "2d";
    return { imageUrl, subReady, mode };
})(SseEditorApp);
