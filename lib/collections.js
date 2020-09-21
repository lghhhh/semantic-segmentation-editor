import { Meteor } from 'meteor/meteor';

SseSamples = new Mongo.Collection("SseSamples");
SseProps = new Mongo.Collection("SseProps");
console.log('------------我是collection， 我加载了.mainjs saveData方法会用到我初始化的collection--------------------')

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
}

