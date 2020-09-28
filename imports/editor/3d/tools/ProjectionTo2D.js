
// let extrinsic = new Matrix4()
// let intrinsic = new Matrix3()
// // 外参矩阵
// extrinsic.set(
//     -0.0174524064372834, 0.999847695156391, -5.55111512312578e-17, -0.254,
//     -0.0697458494953009, -0.0012174183314142, -0.997564050259824, -0.608,
//     -0.99741211642316, -0.0174098932523573, 0.0697564737441253, -0.57,
//     0.0, 0.0, 0.0, 1.0
// )
// // 内参矩阵
// intrinsic.set(
//     1021.65153043719, 0.0, 993.349335070152,
//     0.0, 1023.78374483955, 531.97362876137,
//     0.0, 0.0, 1.0
// )

// intrinsic.multiply(extrinsic)
// console.log(intrinsic)


//-------------------------------------------
// 点云坐标可认为世界坐标
// 世界坐标 X 激光雷达外参矩阵 ---> 相机坐标
//相机坐标 X 相机内参矩阵 ---> 像素坐标系  （相机内参矩阵=相机坐标转图像坐标矩阵 X 图像转像素坐标矩阵）
// 


// 外参矩阵 4x4
let extrinsic = [
    [-0.0174524064372834, 0.999847695156391, -5.55111512312578e-17, -0.254],
    [-0.0697458494953009, -0.0012174183314142, -0.997564050259824, -0.608],
    [-0.99741211642316, -0.0174098932523573, 0.0697564737441253, -0.57,],
    [0.0, 0.0, 0.0, 1.0]
]

// 内参矩阵
let intrinsic = [
    [1021.65153043719, 0.0, 993.349335070152],
    [0.0, 1023.78374483955, 531.97362876137],
    [0.0, 0.0, 1.0]
]


// 矩阵相乘
function matrixMul(a, b) {
    if (a[0].length !== b.length) { return console.log('不符合计算规则！') }
    var c = new Array(a.length);
    for (var i = 0; i < a.length; i++) {
        c[i] = new Array(b[0].length);
        for (var j = 0; j < b[0].length; j++) {
            c[i][j] = 0;
            for (var k = 0; k < b.length; k++) {
                c[i][j] += a[i][k] * b[k][j];
            }
            console.log("I:" + i + "J:" + j + "result:" + c[i][j])
        }
    }
    return c;
}

function project(coordinate) {
    if (!coordinate.length == 3) return;
    let worldCoordinate = coordinate.map(i => [i])
    worldCoordinate.push([1]);
    let cameraCoordinate = matrixMul(extrinsic, worldCoordinate);
    console.log("cameraCoordinate: " + cameraCoordinate)
    cameraCoordinate.pop();
    let pixelCoordinate = matrixMul(intrinsic, cameraCoordinate);

    console.log('pixelCoordinate' + pixelCoordinate)
    pixelCoordinate.pop();
    return pixelCoordinate

}

project([3, 7, 8])