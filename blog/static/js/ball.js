// ball.js
export class Ball {
        constructor(ctx, x, y, size = 35) {
                //Pre-defined variables
                this.ctx = ctx;
                this.size = size;

                //position variables
                this.x = x;
                this.y = y;
                this.prevX = x;
                this.prevY = y;
                //For erasing the old images of the Ball instance
                this.oldX = x;
                this.oldY = y;

                //Time handling variables
                this.prevTime = performance.now();
                
                //mouse handling variables
                this.offsetX = 0;
                this.offsetY = 0;
                
                //velocity variables
                this.velocityX = 0;
                this.velocityY = 0;
                
                //Boolean variables
                this.isDragging = false;
                this.isFalling = false;
                this.needsRedraw = true;
                this.isColliding = false;
                this.other;
        }

        // NeedsRedraw() {
        //         if (this.isColliding == false) {
        //                 this.needsRedraw = true;
        //         } else {
        //                 this.needsRedraw = false;
        //         }
        // }

        draw() {
                if (!this.needsRedraw) {
                        return;
                }
                this.ctx.fillStyle = "rgb(200, 0, 0)";
                this.ctx.clearRect(this.oldX, this.oldY, this.size, this.size);
                this.ctx.fillRect(this.x, this.y, this.size, this.size);
                this.oldX = this.x; this.oldY = this.y;
                this.needsRedraw = true;
        }

        update(gravity, canvasW, canvasH, mouseX, mouseY, others = []) {

                //Velocity calculation
                // const now = performance.now();
                // const deltaY = mouseY - this.prevY;
                // const deltaX = mouseX - this.prevX;
                // const deltaT = (now - this.prevTime) / 3;//why divide by 3?
                // this.velocityY = deltaT > 0 ? deltaY / deltaT : 0;
                // this.velocityX = deltaT > 0 ? deltaX / deltaT : 0;


                if (others.some(ball => this.CheckColision(ball))) {
                        this.isColliding = true;
                        this.velocityX = 0;
                        this.velocityY = 0;
                        console.log("Colliding!");
                }
                else {
                        this.isColliding = false;
                }

                if (this.isFalling) {

                        if (this.y >= canvasH - this.size) { //if on floor
                                this.y = canvasH - this.size;
                                this.isFalling = false;
                                this.velocityY = 0;
                        }
                        // if(this.isColliding){
                        //         return;
                        // }

                        else { //if free fall
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

                var nx = mouseX - this.offsetX;
                var ny = mouseY - this.offsetY;
                if (performance.now() - this.prevTime > 100) { //Checks how much it would move every 100 miliseconds
                        this.prevX = mouseX;
                        this.prevY = mouseY;
                        this.prevTime = performance.now();
                }
                if (this.isColliding) {
                        //If the ball gets moved perfectly verticle/horizontal while it's colliding
                        //then the prevX/Y becomes 0, which would result in a NAN value because there division by 0.
                        this.other.velocityX += (deltaX > 0 || deltaT > 0) ? deltaX / deltaT : 0;
                        this.other.velocityY += (deltaY > 0 || deltaT > 0) ? deltaY / deltaT : 0;
                }
                this.x = nx;
                this.y = ny;
                this.needsRedraw = true;
        }

        endDrag(mouseX, mouseY) {
                const now = performance.now();
                const deltaY = mouseY - this.prevY;
                const deltaX = mouseX - this.prevX;
                const deltaT = (now - this.prevTime) / 3;
                //If deltaT isn't negative, get Velocity. Other wise Velocity is 0
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
                        (otherBallx1 < this.x && this.x < otherBallx2) && (otherBally1 < this.y && this.y < otherBally2) ||
                        (otherBallx1 < ballx35 && ballx35 < otherBallx2) && (otherBally1 < this.y && this.y < otherBally2) ||
                        (otherBallx1 < this.x && this.x < otherBallx2) && (otherBally1 < bally35 && bally35 < otherBally2) ||
                        (otherBallx1 < ballx35 && ballx35 < otherBallx2) && (otherBally1 < bally35 && bally35 < otherBally2)) {
                        this.other = otherBall;
                        return true;
                }
                else {
                        return false;
                }
        }



}