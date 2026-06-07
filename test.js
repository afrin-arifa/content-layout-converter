const firstLayer = [];
let temp = [];
let devider = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
document.querySelectorAll("#editor > *").forEach((el, index, array) => {
    if (temp.length > 0 && devider.includes(el.tagName)) {
        firstLayer.push(temp);
        temp = [el];
    }else{
        temp.push(el);
    }
});
if (temp.length > 0) {
    firstLayer.push(temp);
    temp = [];
}