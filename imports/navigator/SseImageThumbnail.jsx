import React from 'react';
import { CardText, CardTitle } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Approval } from "mdi-material-ui";
import SseGlobals from "../common/SseGlobals";

class SseImageThumbnail extends React.Component {
    constructor() {
        super();
    }

    render() {
        const baseURL = 'http://127.0.0.1:7001/api/file/image?filename='
        const image = this.props.image;
        let name = image.name;
        // let imgURL = image.url.endsWith(".pcd") ? SseGlobals.getFileUrl((image.url.replace(".pcd", ".jpg")) + "?size=small") : SseGlobals.getFileUrl(image.url + "?size=small")

        //向着egg 请求图片数据
        let imgURL = name.endsWith(".pcd") ? `${baseURL + (name.replace(".pcd", ".jpg"))}` : `${baseURL + name}`;
        if (!name) {
            const durl = decodeURIComponent(image.url);
            name = durl.substring(1 + durl.lastIndexOf("/"));
        }
        const { classes } = this.props;
        return (
            <div className="sse-thumbnail vflex flex-align-items-center">
                {/* <img
                    src={image.url.endsWith(".pcd") ? "/pcl_horz_large_neg.png" : SseGlobals.getFileUrl(image.url + "?size=small")}/> */}
                <img src={imgURL} />
                <div className="w100 text-align-center text-crop">{name}</div>
                <div>
                    {this.props.annotated
                        ? <Approval />
                        : null}
                </div>

            </div>
        );
    }
}

const styles = {
    card: {
        width: "345px",
    },
    media: {
        height: 0,
        paddingTop: '56.25%', // 16:9
    },
};

export default withStyles(styles)(SseImageThumbnail)