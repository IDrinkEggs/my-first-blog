// ball.js
export class Ball {
    constructor(ctx, x, y, size = 35) {
            this.ctx = ctx;
            this.x = x;
            this.y = y;
            this.size = size;
            this.offsetX = 0;
            this.offsetY = 0;
            this.velocityX = 0;
            this.velocityY = 0;
            this.isDragging = false;
            this.isFalling = false;
            this.prevX = x;
            this.prevY = y;
            this.currentX = x;
            this.currentY = y;
            this.prevTime = performance.now();
            this.needsRedraw = true;
            this.isCollding = false;
    }

    NeedsRedraw() {
            if (this.isCollding == false) {
                    this.needsRedraw = true;
            } else {
                    this.needsRedraw = false;
            }
    }

    draw(others = []) {
            if (!this.needsRedraw) {
                    return;
            }
            if (this.isDragging && others.some(ball => this.CheckColision(ball))){
                    this.needsRedraw = false;
                    this.isCollding = true
                    console.log("Colliding!");
                    return;
            }
            this.isCollding = false;
            this.ctx.fillStyle = "rgb(200, 0, 0)";
            this.ctx.clearRect(this.currentX, this.currentY, this.size, this.size);
            this.ctx.fillRect(this.x, this.y, this.size, this.size);
            this.currentX = this.x; this.currentY = this.y;
            this.needsRedraw = true;
    }

    update(gravity, canvasW, canvasH) {
            if (this.isFalling) {
                    if (this.y >= canvasH - this.size) { //if on floor
                            this.y = canvasH - this.size;
                            this.isFalling = false;
                            this.velocityY = 0;
                            this.velocityX = 0;
                    }else if (this.isCollding){
                            this.velocityX = 0;
                            this.velocityY = 0;
                    } else { //if free fall
                            this.velocityY += gravity;
                            this.y += this.velocityY;
                            this.x += this.velocityX;
                            this.y = Math.floor(this.y);
                            this.x = Math.max(0, Math.min(canvasW - this.size, Math.floor(this.x)));
                    }
            }
    }

    drawHUD(mouseX, mouseY) {
            const info = this.getDebugInfo(mouseX, mouseY);
            this.ctx.clearRect(590, 10, 200, info.length * 20 + 10);
            this.draw();
            this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            this.ctx.fillRect(590, 10, 200, info.length * 20 + 10);
            this.ctx.font = "14px monospace";
            this.ctx.fillStyle = "white";
            info.forEach((line, i) => {
                    this.ctx.fillText(line, 600, 30 + i * 20);
            });
    }

    getDebugInfo(mouseX, mouseY) {
            return [
                    `yPos: ${Math.round(this.y)} px`,
                    `velocity: ${this.velocityY.toFixed(2)} px/frame`,
                    `mouse: (${mouseX}, ${mouseY})`
            ];
    }

    isMouseInside(x, y) {
            return (
                    x >= this.x && x <= this.x + this.size &&
                    y >= this.y && y <= this.y + this.size
            );
    }

    startDrag(mouseX, mouseY) {
            this.isDragging = true;
            this.isFalling = false;
            this.offsetX = mouseX - this.x;
            this.offsetY = mouseY - this.y;
            this.prevX = mouseX;
            this.prevY = mouseY;
            this.prevTime = performance.now();
            this.needsRedraw = true;
    }

    drag(mouseX, mouseY) {
            if (this.isCollding){

            }else{
                    this.x = mouseX - this.offsetX;
                    this.y = mouseY - this.offsetY;
            }
            if (performance.now() - this.prevTime > 100) {
                    this.prevX = mouseX;
                    this.prevY = mouseY;
                    this.prevTime = performance.now();
            }
            this.needsRedraw = true;
    }

    endDrag(mouseX, mouseY) {
            const now = performance.now();
            const deltaY = mouseY - this.prevY;
            const deltaX = mouseX - this.prevX;
            const deltaT = (now - this.prevTime) / 3;
            this.velocityY = deltaT > 0 ? deltaY / deltaT : 0;
            this.velocityX = deltaT > 0 ? deltaX / deltaT : 0;
            this.isDragging = false;
            this.isFalling = true;
            this.needsRedraw = true;
    }

    CheckColision(otherBall) { //v is for vertex
            let ballx35 = this.x + this.size;
            let bally35 = this.y + this.size;
            let otherBallx1 = otherBall.x
            let otherBallx2 = otherBall.x + otherBall.size;
            let otherBally1 = otherBall.y;
            let otherBally2 = otherBall.y + otherBall.size;;
            // if (((otherBallx1 < ballv1 && ballv1 < otherBallx2) || (otherBallx1 < ballv2 && ballv2 < otherBallx2)) &&
            //         ((otherBally1 < ballv3 && ballv3 < otherBally2) || (otherBally1 < ballv4 && ballv4 < otherBally2))) {
            //         return true;
            // }
            if (
                    (otherBallx1 <= this.x && this.x <= otherBallx2) && (otherBally1 <= this.y && this.y <= otherBally2) ||
                    (otherBallx1 <= ballx35 && ballx35 <= otherBallx2) && (otherBally1 <= this.y && this.y <= otherBally2) ||
                    (otherBallx1 <= this.x && this.x <= otherBallx2) && (otherBally1 <= bally35 && bally35 <= otherBally2) ||
                    (otherBallx1 <= ballx35 && ballx35 <= otherBallx2) && (otherBally1 <= bally35 && bally35 <= otherBally2)){
                    return true;
            }
            else {
                    return false;
            }
    }

}