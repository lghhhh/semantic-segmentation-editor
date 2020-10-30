import { Meteor } from 'meteor/meteor';

SseSamples = new Mongo.Collection("SseSamples"); // 存储pcd文件的header头
SseProps = new Mongo.Collection("SseProps"); //存储了tags
SseObject = new Mongo.Collection("SseObject");// 语义分割对象
SseLayer = new Mongo.Collection("SseLayer");// 点云数据层次

if (Meteor.isServer) {
    Meteor.publish("sse-data-descriptor", function (imageUrl) {
        return SseSamples.find({ url: imageUrl });
    });

    Meteor.publish("sse-labeled-images", function () {
        return SseSamples.find(
            { $where: 'this.objects && this.objects.length>0' },
            { fields: { file: 1, url: 1 } },
        );
    });

    Meteor.publish('sse-props', function () {
        return SseProps.find({});
    });
    Meteor.publish('sse-object', function () {
        return SseObject.find({});
    });
    Meteor.publish('sse-layer', function () {
        return SseLayer.find({});
    });
}

