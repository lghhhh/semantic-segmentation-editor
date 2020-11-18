//-------------------------------------------
// 点云坐标可认为世界坐标
// 世界坐标 X 激光雷达外参矩阵 ---> 相机坐标
//相机坐标 X 相机内参矩阵 ---> 像素坐标系  （相机内参矩阵=相机坐标转图像坐标矩阵 X 图像转像素坐标矩阵）
// 


// // 外参矩阵 4x4
// let extrinsic = [
//     [-0.0174524064372834, 0.999847695156391, -5.55111512312578e-17, -0.254],
//     [-0.0697458494953009, -0.0012174183314142, -0.997564050259824, -0.608],
//     [-0.99741211642316, -0.0174098932523573, 0.0697564737441253, -0.57,],
//     [0.0, 0.0, 0.0, 1.0]
// ]

// // 内参矩阵
// let intrinsic = [
//     [1021.65153043719, 0.0, 993.349335070152],
//     [0.0, 1023.78374483955, 531.97362876137],
//     [0.0, 0.0, 1.0]
// ]

// 新参数 编号 1594259475
let extrinsic = [
    [-0.0317468196153641, -0.999492108821869, 0.00276703014969826, -0.178828567266464],
    [0.039061676710844, -0.0040070153772831, -0.999228775501251, -0.756422758102417],
    [0.998732388019562, -0.031614251434803, 0.0391690507531166, -0.850554406642914],
    [0.0, 0.0, 0.0, 1.0]
]
let intrinsic = [
    [1021.65155029297, 0.0, 993.349365234375],
    [0.0, 1023.78375244141, 531.9736328125],
    [0.0, 0.0, 1.0]
]
let intrinsic2 = [
    [1021.65155029297, 0.0, 993.349365234375, 0.0],
    [0.0, 1023.78375244141, 531.9736328125, 0.0],
    [0.0, 0.0, 1.0, 0.0]
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
            // console.log("I:" + i + "J:" + j + "result:" + c[i][j])
        }
    }
    return c;
}

function project(coordinate) {
    // if (!coordinate.length == 3) return;
    // let worldCoordinate = coordinate.map(i => [i])
    let worldCoordinate = [[coordinate.x], [coordinate.y], [coordinate.z]]
    // 进行齐次坐标运算加1 维度
    worldCoordinate.push([1]);
    let cameraCoordinate = matrixMul(extrinsic, worldCoordinate);
    // console.log("cameraCoordinate:----- " + cameraCoordinate)
    cameraCoordinate.pop();
    let pixelCoordinate = matrixMul(intrinsic, cameraCoordinate);

    // console.log('--------pixelCoordinate' + pixelCoordinate)
    let scaleFactor = pixelCoordinate.pop();
    // return pixelCoordinate
    return [pixelCoordinate[0] / scaleFactor, pixelCoordinate[1] / scaleFactor]

}
// 计算方式 先内参外参相乘 再x世界左边 直接得出像素坐标
function project2(coordinate) {
    let worldCoordinate = [[coordinate.x], [coordinate.y], [coordinate.z], [1]]
    let parameter = matrixMul(intrinsic2, extrinsic);
    let pixelCoordinate = matrixMul(parameter, worldCoordinate);
    // return pixelCoordinate
    let scaleFactor = pixelCoordinate.pop();
    return [pixelCoordinate[0] / scaleFactor, pixelCoordinate[1] / scaleFactor]

}
function project2d(coordinates) {
    if (!coordinates.length) return []
    return coordinates.map(item => project2(item))
}
export { project2d }
