export default class ImageProjection {
    /**
     * @init
     * @param {String} canvasImgCtx 绘制的图像的canvas 元素
     * @param {String} cavnasImgSelection 隐藏图层 元素 
     * @param {String} imgHeight 目标图像高度
     * @param {String} ImgWidth 目标图像宽度
     * @param {String} srcHeight 原始图像高度
     * @param {String} srcWidth 原始图像宽度
     * @param {Array} intrinsic 相机内参 3x4（）
     * @param {Array} extrinsic 世界坐标转换外参 4x4矩阵

     */
    init(canvasImgEle, cavnasImgSelectionEle, imgHeight, imgWidth, srcHeight, srcWidth, intrinsic, extrinsic) {
        // this.canvas = document.getElementById(canvasImgID);
        // this.ctx = canvas.getContext('2d');
        this.canvasImgEle = canvasImgEle;
        this.ctx = canvasImgEle.getContext('2d');
        this.ctxSelection = cavnasImgSelectionEle.getContext('2d');
        this.imgHeight = imgHeight;
        this.imgWidth = imgWidth;
        this.srcHeight = srcHeight;
        this.srcWidth = srcWidth;
        this.intrinsic = intrinsic;
        this.extrinsic = extrinsic;
        // 相机内参外参相乘
        this.parameter = this.matrixMul(intrinsic, extrinsic);
        // 存储隐藏层 颜色index和对象的对应关系
        this.ColorMap = new Map();
    }
    /**
     * 设置原始数据集合
     * @param {Array} originalData 点原始数据
     */
    setOriginalData(originalData) {
        this.originalData = originalData;
    }

    /**
     * 矩阵相乘 A矩阵乘B矩阵 
     * @param {Array} a 
     * @param {Array} b 
     */
    matrixMul(a, b) {
        if (a[0].length !== b.length) { return console.log('不符合计算规则！') }
        let c = new Array(a.length);
        for (let i = 0; i < a.length; i++) {
            c[i] = new Array(b[0].length);
            for (let j = 0; j < b[0].length; j++) {
                c[i][j] = 0;
                for (let k = 0; k < b.length; k++) {
                    c[i][j] += a[i][k] * b[k][j];
                }
                // console.log("I:" + i + "J:" + j + "result:" + c[i][j])
            }
        }
        return c;
    }
    /**
     * 将单个 3d坐标转化成2d坐标，计算方式： 相机内参外参相乘、 乘世界坐标 像素坐标
     * @param {object} coordinate 
     */
    pointProject(coordinate) {
        //计算需要加多一维度 ， 使用齐次坐标
        let worldCoordinate = [[coordinate.x], [coordinate.y], [coordinate.z], [1]]
        let pixelCoordinate = this.matrixMul(this.parameter, worldCoordinate);
        // 取出比例因子
        let scaleFactor = pixelCoordinate.pop();
        //计算具体平面坐标
        return [pixelCoordinate[0] / scaleFactor, pixelCoordinate[1] / scaleFactor]

    }

    /**
     * 将2d点投影到图像
     * @param {Array} pointArr 
     */
    projectAdd(pointArr, printColor, selectionColor) {
        // let xy = []
        let selectionImgData = this.ctxSelection.createImageData(1, 1)
        selectionImgData.data[0] = selectionColor.r;
        selectionImgData.data[1] = selectionColor.g;
        selectionImgData.data[2] = selectionColor.b;
        selectionImgData.data[3] = selectionColor.a;
        //
        pointArr.forEach(([x, y]) => {
            //过滤超过显示画面的点
            if (x >= 0 && x <= this.srcWidth && y >= 0 && y <= this.srcHeight) {
                let radius = 2
                let startAngle = 0
                let endAngle = 2 * Math.PI
                let yHeight = Math.floor(y * this.imgHeight / this.srcHeight);
                let xWidth = Math.floor(x * this.imgWidth / this.srcWidth);
                this.ctx.beginPath();
                this.ctx.arc(xWidth, yHeight, radius, startAngle, endAngle, false)
                this.ctx.fillStyle = printColor
                this.ctx.fill()
                this.ctx.closePath()
                //隐藏图层绘制

                this.ctxSelection.putImageData(selectionImgData, xWidth, yHeight);
                // xy.push(`x:${xWidth}-- y:${yHeight}`)
            }
        })
        // console.log('X---Y:', xy)
        // this.ctx.stroke()
        // this.ctxSelection.stroke()
    }
    /**
     * 添加点击监听 返回点击形状的id值
     * @param {} e 
     */
    onClick(clientX, clientY) {
        let bbox = this.canvasImgEle.getBoundingClientRect();
        let x = Math.floor((clientX - bbox.left) * this.ctx.canvas.width / bbox.width);
        let y = Math.floor((clientY - bbox.top) * this.ctx.canvas.height / bbox.height);

        let imgData = this.ctxSelection.getImageData(x - 2, y - 2, 4, 4).data;//扩大获取范围，获取点击位置周围4个像素
        // let indexArr = new Set(); //存放范围内可能的index值
        let index = null
        for (let i = 0; i < imgData.length; i += 4) {
            let [r, g, b, a] = [imgData[i + 0], imgData[i + 1], imgData[i + 2], imgData[i + 3]];
            if (a) {
                index = r * 256 * 256 + g * 256 + b;
                // let index = r * 256 * 256 + g * 256 + b
                // indexArr.add(index)
            }
        }
        // if (indexArr.size > 0 && indexArr.size <= 1) {
        return this.ColorMap.has(index) ? this.ColorMap.get(index) : null
        // }
        // return null
    }
    /**
     * 外部调用方法
     * @param {*} objectName  分割对象的name
     * @param {*} selectedDataIdx  对象点数据idx
     * @param {*} printColor  绘制点的颜色 默认红色
     * @param {*} selectionColor 有点云对象index 决定颜色
     * @param {*} mode  添加：add  修改：modify 删除：delete 
     */
    project(objectName, selectedDataIdx, printColor = "rgba(255,0,0,0.4)", selectionColor, mode) {
        // if (!selectedData.length || !selectedColor.length) return null
        if (!!selectedDataIdx.length && !!printColor && !!mode) {
            //不同的数据源 过滤规则可能会改变:当前值投影正前方的图像
            let selectedData = selectedDataIdx.map(idx => this.originalData[idx]).filter(data => data.x >= 0)
            if (selectedData.length < 1) return
            let point2dArrs = selectedData.map(item => this.pointProject(item))
            let r = Math.floor(selectionColor / 256 / 256);
            let g = Math.floor((selectionColor - r * 256 * 256) / 256);
            let b = (selectionColor % 256);
            let a = 255;// 因为Alpha合成时 与rgb现成 必须为255
            let indexColor = { r, g, b, a };
            // let indexColor = `rbga(${r},${g},${b},${a})`;
            console.log('selectionColor:' + JSON.stringify(indexColor) + '-------' + 'objectName:' + objectName)
            this.ColorMap.set(selectionColor, objectName)
            this.projectAdd(point2dArrs, printColor, indexColor)
        }
    }
}
