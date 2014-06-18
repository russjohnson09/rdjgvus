function drawCircle(ctx,x,y,radius) {
    ctx.beginPath();                    //begin path, I think fill might already closepath.
    ctx.arc(x,y,radius,0,Math.PI*2);
    ctx.closePath();
    ctx.fill();
}
