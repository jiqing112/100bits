var DECLARE = "别看了，乱七八糟的 浪费时间。"
eval("'"+DECLARE + "'")
var canvas = document.getElementById('drawer');
var ctx = canvas.getContext('2d');
function resize() {
    canvas.width = 1000;
    canvas.height = 500;
}
var ratio = 2
window.onresize = function () {
    resize();
};
resize()
drewPoints = []
function record(x, y){
    x = Number.parseInt(x / ratio) * ratio
    y = Number.parseInt(y / ratio) * ratio
    for (let i = 0; i < drewPoints.length; i++) {
        const element = drewPoints[i];
        if(element[0] == x && element[1] == y){
            drewPoints.splice(element,1)
            return
        }
    }
    drewPoints.push([x, y])
}
function draw(x, y){
    x = Number.parseInt(x / ratio) * ratio
    y = Number.parseInt(y / ratio) * ratio
    var imgd = ctx.getImageData(x, y, 1, 1).data
    var p = imgd[1] == 0
    ctx.fillStyle = p ? '#eee': '#000'
    ctx.fillRect(x,y,ratio,ratio);
}
if (document.body.ontouchstart !== undefined) {
    // Mobile
    canvas.ontouchstart = function (e) {
        var x = e.touches[0].clientX - canvas.offsetLeft
        var y = e.touches[0].clientY - canvas.offsetTop
        draw(x,y)
        record(x,y)
    }
} else {
    canvas.onmousedown = function(e) {
        var x = e.clientX - canvas.offsetLeft
        var y = e.clientY - canvas.offsetTop
        draw(x,y)
        record(x,y)
    }
}


$(document).ready(function() {
    var ACTIVED_CSS = 'uk-button-danger'
    var progressbar = $('#progressbar')
    var playProgress = undefined
    var last = []
    var isReserve = false
    var playBtn = $('.btn-play')
    var nextBtn = $('.btn-next')
    var prevBtn = $('.btn-prev')
    var towardBtn = $('.btn-toward')
    var backwardBtn = $('.btn-backward')
    var resetBtn = $('.btn-reset')
    var uploadBtn = $('.btn-upload')
    var performDrew = () => {

        if(isReserve){
            progressbar.val(progressbar.val() - 1)
            point = last[progressbar.val()]
            draw(point[0], point[1])
            $('[data-label=user]').text(point[2])
        } else {
            point = last[progressbar.val()]
            draw(point[0], point[1])
            $('[data-label=user]').text(point[2])
            progressbar.val(progressbar.val() + 1)
        }
        if(progressbar.val() >= last.length && !isReserve){
            clearInterval(playProgress)
            inactiveBtn(playBtn)
            disableBtn(playBtn)
            disableBtn(nextBtn)
            disableBtn(towardBtn)
            enableBtn(prevBtn)
            enableBtn(backwardBtn)
            return
        } else if(progressbar.val() <= 0 && isReserve){
            clearInterval(playProgress)
            inactiveBtn(playBtn)
            disableBtn(playBtn)
            disableBtn(prevBtn)
            disableBtn(backwardBtn)
            enableBtn(nextBtn)
            enableBtn(towardBtn)
            return
        }
        activeBtn(playBtn)
    }
    var isBtnActived = (btn) => {
        return btn.hasClass(ACTIVED_CSS)
    }
    var inactiveBtn = (btn) => {
        return btn.removeClass(ACTIVED_CSS)
    }
    var activeBtn = (btn) => {
        return btn.addClass(ACTIVED_CSS)
    }
    var disableBtn = (btn) => {
        return btn.attr('disabled', true)
    }
    var enableBtn = (btn) => {
        return btn.attr('disabled', false)
    }
    $.get('api/pic')
     .then(res =>{
        res.forEach(e => {
            last.push([e.x, e.y, e.user])
        });
        progressbar.attr('max', last.length)
    })
    nextBtn.click(performDrew)
    prevBtn.click(() => {
        isReserve = true
        performDrew()
        isReserve = false
    })
    towardBtn.click(() => {
        isReserve = false
        inactiveBtn(backwardBtn)
        activeBtn(towardBtn)
    })
    backwardBtn.click(() => {
        isReserve = true
        inactiveBtn(towardBtn)
        activeBtn(backwardBtn)
        if(progressbar.val() > 0 && isReserve){
            activeBtn(playBtn)
            enableBtn(playBtn)
            enableBtn(prevBtn)
            enableBtn(backwardBtn)
            if(progressbar.val() < last.length)
                enableBtn(nextBtn)
            return
        }
    })
    playBtn.click(function(){
        if(isBtnActived(playBtn)){
            clearInterval(playProgress)
            inactiveBtn(playBtn)
        } else {
            activeBtn(playBtn)
            playProgress = setInterval(performDrew, 1000);
        }
    })
    resetBtn.click(function(){
        var a = drewPoints
        a.forEach(e => {
            draw(e[0], e[1])
            record(e[0], e[1])
        });
    })
    uploadBtn.click(function(){
        UIkit.notification('正在上传...');
        $.post('api/upload', {
            points: drewPoints
        })
         .then(res => {
            UIkit.notification('上传成功!');
         })
         .catch(err => {
            UIkit.notification('上传失败! 太多bug了..');
         })
    })
    playBtn.click()
});