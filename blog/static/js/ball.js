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
                this.deltaX;
                this.deltaY;

                //Time handling variables
                this.prevTime = performance.now();
                this.deltaT;
                
                //mouse handling variables
                this.offsetX = 0;
                this.offsetY = 0;
                
                //velocity variables
                this.velocityX = 0;
                this.velocityY = 0;
                
                //Boolean variables
                this.isDragging = false;
                this.isFalling = false; //stops the balls in place to play and test with
                this.needsRedraw = true;
                this.isColliding = false;
                this.bottomCollision = false;
                this.other;

                //Color variable
                this.color = `rgb(${Math.floor(Math.random()*226+30)}, ${Math.floor(Math.random()*226+30)}, ${Math.floor(Math.random()*226+30)})`;
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
                this.x = Math.floor(this.x);
                this.y = Math.floor(this.y);
                //Generate's random color
                this.ctx.fillStyle = this.color;
                this.ctx.clearRect(this.oldX, this.oldY, this.size, this.size);
                this.ctx.fillRect(this.x, this.y, this.size, this.size);
                this.oldX = this.x; this.oldY = this.y;
                this.needsRedraw = true;
        }

        //Checks collisions, checks if the object is in the floor, if it's falling
        update(gravity, canvasW, canvasH, mouseX, mouseY, others = []) {

                //Velocity calculation
                const now = performance.now();
                this.deltaY = mouseY - this.prevY;
                this.deltaX = mouseX - this.prevX;
                this.deltaT = (now - this.prevTime)/3;//why divide by 3?
                this.y += this.velocityY;
                this.x += this.velocityX;

                if (others.some(ball => this.CheckColision(ball) && !ball.isDragging)) {
                        let holdVelocity = this.velocityX;
                        this.velocityX = this.other.velocityX;
                        this.other.velocityX = holdVelocity;
                        holdVelocity = this.velocityY;
                        this.velocityY = this.other.velocityY;
                        this.other.velocityY = holdVelocity;
                        //console.log("Colliding!!");
                }

                //if(this.velocityY == 0) this.isFalling = false;
                //if on the side of canvas
                this.x = Math.max(0, Math.min(canvasW - this.size, Math.floor(this.x)));
                this.velocityX = 0;
                
                if (this.isFalling && !this.isDragging) {
                        
                        this.velocityY += gravity;
                        this.y = Math.floor(this.y);
                }
                
                if (this.y >= canvasH - this.size || this.bottomCollision) { //if on floorz
                        if (this.y >= canvasH - this.size){
                                this.y = canvasH - this.size;
                                this.isFalling = false;}
                        
                        if(!this.velocityY == 0){
                                this.velocityY = 0;
                        }
                }else{
                        this.isFalling = true;
                }
        }

        drawHUD(mouseX, mouseY) {
                const info = this.getDebugInfo(mouseX, mouseY);
                this.ctx.clearRect(590, 10, 240, info.length * 20 + 10);
                this.draw();
                this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
                this.ctx.fillRect(590, 10, 240, info.length * 20 + 10);
                this.ctx.font = "14px monospace";
                this.ctx.fillStyle = "white";
                //Inputting all of getDebugInfo into the gray HUD space
                //Loops through each element and returns the data and the index
                info.forEach((line, i) => {
                        this.ctx.fillText(line, 600, 30 + i * 20);
                });
        }

        getDebugInfo(mouseX, mouseY) {
                return [
                        `xPos: ${Math.round(this.x)} px`,
                        `yPos: ${Math.round(this.y)} px`,
                        `X-velocity: ${this.velocityX.toFixed(2)} px/frame`,
                        `Y-velocity: ${this.velocityY.toFixed(2)} px/frame`,
                        `mouse: (${mouseX}, ${mouseY})`,
                        `isColliding: ${this.isColliding}`,
                        `isFalling: ${this.isFalling}`
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
                this.velocityX = 0;
                this.velocityY = 0;
        }

        drag(mouseX, mouseY, checkEverySec, otherBallList) {

                var nx = mouseX - this.offsetX;
                var ny = mouseY - this.offsetY;
                //this.velocityX = 0; this.velocityY = 0;
                if (performance.now() - this.prevTime > checkEverySec) { //Checks how much it would move every 100 miliseconds
                        this.prevX = mouseX;
                        this.prevY = mouseY;
                        this.prevTime = performance.now();
                }
                if (otherBallList.some(ball => this.CheckColision(ball))) {
                        //If the ball gets moved perfectly verticle/horizontal while it's colliding
                        //then the prevX/Y becomes 0, which would result in a NAN value because there division by 0.
                        this.other.x += this.deltaX;
                        this.other.y += this.deltaY;
                        this.other.velocityX += (this.deltaX != 0 && this.deltaT > 0) ? this.deltaX / this.deltaT : 0;
                        this.other.velocityY += (this.deltaY != 0 && this.deltaT > 0) ? this.deltaY / this.deltaT : 0;
                }
                this.x = nx;
                this.y = ny;
                this.needsRedraw = true;
        }

        endDrag(mouseX, mouseY) {
                const now = performance.now();
                this.deltaY = mouseY - this.prevY;
                this.deltaX = mouseX - this.prevX;
                this.deltaT = (now - this.prevTime) / 3;
                //If this.deltaT isn't negative, get Velocity. Other wise Velocity is 0
                this.velocityY = this.deltaT > 0 ? this.deltaY / this.deltaT : 0;
                this.velocityX = this.deltaT > 0 ? this.deltaX / this.deltaT : 0;
                this.isDragging = false;
                this.isFalling = true;
                this.needsRedraw = true;
        }

        CheckColision(otherBall) { //v is for vertex
                let ballx1 = this.x;
                let bally1 = this.y;
                let ballx2 = this.x + this.size;
                let bally2 = this.y + this.size;
                let OBx1 = otherBall.x
                let OBx2 = otherBall.x + otherBall.size;
                let OBy1 = otherBall.y;
                let OBy2 = otherBall.y + otherBall.size;;

                if(otherBall === this){
                        console.log("Same object");
                }
                // if (((OBx1 < ballv1 && ballv1 < OBx2) || (OBx1 < ballv2 && ballv2 < OBx2)) &&
                //         ((OBy1 < ballv3 && ballv3 < OBy2) || (OBy1 < ballv4 && ballv4 < OBy2))) {
                //         return true;
                // }
                if (
                        //             ball                       OB
                        //               N                            N
                        //      x1,y1---------x2,y1        OBx1,OBy1-----OBx2,OBy1
                        //        |             |              |             |
                        //        |             |              |             |
                        //     W  |             |  E         W |             |  E
                        //        |             |              |             |
                        //        |             |              |             |
                        //      x1,y2---------x2,y2        OBx1,OBy2-----OBx2,OBy2
                        //               S                            S

                        //Fix:
                        //In the old version, I compared N/E/S/W edges on ball with their respective edges on other ball
                        //eg. (OBx1 < ballx && ballx < OBx2) && (OBy1 < bally && bally < OBy2) which translates to:
                        //      Is the North plane, of ball, colliding with the North plane of otherBall
                        //That doesn't make sense, if the this was the only if condition, the box would have to fully
                        //collide with each other to finall reach the north side of it's counter part side.
                        //Instead, I fixed it so each edge on ball checks to see if it collided with the edge of the 
                        //opposite NESW edge on otherBall (eg. North side checks for South side)
                        
                        //Version 1. Checks which side gets collided. Edge case: object's position could bypass the ball == OB
                        //condition, letting Velocity values higher than 1 by pass Collision system. Could use for collision direction check
                        // //North side checking for otherball South side
                        // ((OBx1 <= ballx1 && ballx1 <= OBx2) && (OBx1 <= ballx2 && ballx2 <= OBx2))  &&  (bally == OBy2) ||
                        // //South side checking for otherball North side
                        // ((OBx1 <= ballx1 && ballx1 <= OBx2) && (OBx1 <= ballx2 && ballx2 <= OBx2))  &&  (bally2 == OBy1) ||
                        // //East side checking for otherball West side
                        // (ballx2 == OBx1)  &&  ((OBy1 <= bally1 && bally1 <= OBy2) && (OBy1 <= bally2 && bally2 <= OBy2)) ||
                        // //West side checking for otherball East side
                        // (ballx1 == OBx2)  &&  ((OBy1 <= bally1 && bally1 <= OBy2) && (OBy1 <= bally2 && bally2 <= OBy2)))

                        //CARE FULL, CHANGING THE SCREEN ORIGIN FROM TOP LEFT BEING (0,0) WILL MESS UP WITH THIS COLLISION CHECK

                        //Version 2. Fixed edge case above
                        //North side checking for otherball South side
                        (((OBx1 <= ballx1 && ballx1 <= OBx2) || (OBx1 <= ballx2 && ballx2 <= OBx2))  &&  (bally1 <= OBy2 && bally1 > OBy1)) ||
                        //South side checking for otherball North side
                        (((OBx1 <= ballx1 && ballx1 <= OBx2) || (OBx1 <= ballx2 && ballx2 <= OBx2))  &&  (bally2 >= OBy1 && bally2 < OBy2)) ||
                        //East side checking for otherball West side
                        ((ballx2 >= OBx1 && ballx2 < OBx2)  &&  ((OBy1 <= bally1 && bally1 <= OBy2) && (OBy1 <= bally2 && bally2 <= OBy2))) ||
                        //West side checking for otherball East side
                        ((ballx1 <= OBx2 && ballx1 > OBx1)  &&  ((OBy1 <= bally1 && bally1 <= OBy2) || (OBy1 <= bally2 && bally2 <= OBy2))))
                        {
                                //The check conditions are similar with N/S and W/E. Thought that was interesting
                                this.FixCollision(otherBall);
                                this.isColliding = true;
                                this.other = otherBall;
                                this.other.isColliding = true;
                                return true;
                }
                else {
                        this.isColliding = false;
                        this.bottomCollision = false;
                        this.other = null;
                        return false;
                }
        }

        FixCollision(otherball){ //Push the other ball out of it self
                let xhalfwayPoint = this.x + Math.floor(this.size/2);
                // console.log(this.x);
                // console.log(xhalfwayPoint);
                // console.log(this.x+35);
                let yhalfwayPoint = this.y + Math.floor(this.size/2);
                //Fix x-axis collisions
                if (otherball.x+35 <= xhalfwayPoint){ //other ball colliding from left
                        let xOverlap = Math.floor(otherball.x - this.x+this.size);
                        console.log("Left");
                        console.log(xOverlap);
                        otherball.x -= xOverlap;
                }
                else if (xhalfwayPoint <= otherball.x){ //other ball colliding from right
                        let xOverlap = Math.floor(this.x - otherball.x+otherball.size);
                        console.log("Right");
                        console.log(xOverlap);
                        otherball.x += xOverlap;
                }
                //Fix y-axis collisions
                if (otherball.y+35 <= yhalfwayPoint){ //other ball colliding from top
                        let yOverlap = Math.floor(otherball.y - this.y+this.size);
                        console.log("Top");
                        console.log(yOverlap);
                        otherball.y -= yOverlap;
                }
                else if (yhalfwayPoint <= otherball.y){ //other ball colliding from botom
                        let yOverlap = Math.floor(this.y - otherball.y+otherball.size);
                        console.log("Bottom");
                        this.bottomCollision = true;
                        this.isFalling = false;
                        console.log(yOverlap);
                        otherball.y += yOverlap;
                }
        }


}