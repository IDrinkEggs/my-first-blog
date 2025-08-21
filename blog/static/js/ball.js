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
                this.isStatic = false;
                
                //Boolean variables
                this.isDragging = false;
                this.isFalling = false; //stops the balls in place to play and test with
                this.needsRedraw = true;

                //Collision variables
                this.isColliding = false;
                this.bottomCollided = false;
                this.fixList = [];
                this.isOverlapped = false;

                //Object original variable
                this.color = `rgb(${Math.floor(Math.random()*226+30)}, ${Math.floor(Math.random()*226+30)}, ${Math.floor(Math.random()*226+30)})`;
                this.id = "ID template";
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
        update(gravity, canvasW, canvasH, others = []) {

                //Recording prev x & y positions >>>
                const checkEverySec = 50;
                if (performance.now() - this.prevTime > checkEverySec) { //Checks how much it would move every 100 miliseconds
                        this.prevX = this.x;
                        this.prevY = this.y;
                        this.prevTime = performance.now();
                }
                //<<< Recording prev x & y positions

                //Applying Velocity >>>
                this.y += this.velocityY;
                this.x += this.velocityX;
                this.isStatic = this.velocityX == 0 && this.velocityY == 0;
                //<<< Applying Velocity

                //Checking Collisions
                if (others.some(ball => this.CheckColision(ball) && !ball.isDragging)) {
                        
                }
                //
                
                //Add's free fall acceleration >>>
                if (this.isFalling && !this.isDragging) {
                        
                        this.velocityY += gravity;
                        this.y = Math.floor(this.y);
                }
                //<<< Add's free fall acceleration

                //Canvas boundary checks >>>
                //--if on the floor
                if (this.y >= canvasH - this.size || this.bottomCollided) {
                        this.isFalling = false;
                        if (this.y >= canvasH - this.size){
                                this.y = canvasH - this.size;
                        }
                        if(!this.velocityY == 0){
                                this.velocityY = 0;
                        }
                }else{
                        this.isFalling = true;
                }
                //--if colliding with the sides
                if (this.x < 0){
                        this.x = 0;
                        this.velocityX = 0;
                }
                else if(this.x > canvasW-this.size){
                        this.x = canvasW-this.size;
                        this.velocityX = 0;
                }
                //<<< Canvas boundary checks
        }

        getDebugInfo(mouseX, mouseY) {
                return [
                        `xPos: ${Math.round(this.x)} px`,
                        `yPos: ${Math.round(this.y)} px`,
                        `X-velocity: ${this.velocityX.toFixed(2)} px/frame`,
                        `Y-velocity: ${this.velocityY.toFixed(2)} px/frame`,
                        `mouse: (${mouseX}, ${mouseY})`,
                        `isColliding: ${this.isColliding}`,
                        `isFalling: ${this.isFalling}`,
                        `isOverlapped: ${this.isOverlapped}`
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
                // if (otherBallList.some(ball => this.CheckColision(ball))) {
                //         //If the ball gets moved perfectly verticle/horizontal while it's colliding
                //         //then the prevX/Y becomes 0, which would result in a NAN value because there division by 0.
                //         this.other.x += this.deltaX;
                //         this.other.y += this.deltaY;
                //         this.other.velocityX += (this.deltaX != 0 && this.deltaT > 0) ? this.deltaX / this.deltaT : 0;
                //         this.other.velocityY += (this.deltaY != 0 && this.deltaT > 0) ? this.deltaY / this.deltaT : 0;
                // }
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
                        //CARE FULL, CHANGING THE SCREEN ORIGIN FROM TOP LEFT BEING (0,0) WILL MESS UP WITH THIS COLLISION CHECK

                        //Version 2. Fixed edge case above
                        //North side checking for otherball South side
                        (((OBx1 <= ballx1 && ballx1 <= OBx2) || (OBx1 <= ballx2 && ballx2 <= OBx2))  &&  (bally1 <= OBy2 && bally1 > OBy1)) ||
                        //South side checking for otherball North side
                        (((OBx1 <= ballx1 && ballx1 <= OBx2) || (OBx1 <= ballx2 && ballx2 <= OBx2))  &&  (bally2 >= OBy1 && bally2 < OBy2)) ||
                        //East side checking for otherball West side
                        ((ballx2 >= OBx1 && ballx2 < OBx2)  &&  ((OBy1 <= bally1 && bally1 <= OBy2) || (OBy1 <= bally2 && bally2 <= OBy2))) ||
                        //West side checking for otherball East side
                        ((ballx1 <= OBx2 && ballx1 > OBx1)  &&  ((OBy1 <= bally1 && bally1 <= OBy2) || (OBy1 <= bally2 && bally2 <= OBy2))))
                        {
                                //console.log("Colliding!");
                                if(((OBx1 < ballx1 && ballx1 < OBx2) || (OBx1 < ballx2 && ballx2 < OBx2)) && ((OBy1 < bally1 && bally1 < OBy2) || (OBy1 < bally2 && bally2 < OBy2))){
                                        console.log("Overlapping!");
                                        this.isOverlapped = true;
                                        if(!this.fixList.includes(otherBall)){
                                                this.fixList.push(otherBall);
                                        }
                                }
                                else{
                                        this.isOverlapped = false;
                                }
                                this.isColliding = true;
                                return true;
                }
                else {
                        //Removes the object it checked with if it's in the fixList >>>
                        if(this.fixList.includes(otherBall)){
                                this.fixList.splice(this.fixList.indexOf(otherBall), 1);
                        }
                        //<<<

                        this.isColliding = false;
                        this.bottomCollided = false;
                        this.other = null;
                        return false;
                }
        }

        FindCollisionDir(otherball){ //Push the other ball out of it self
                //s = self(collided), o = other(collider)
                const selfMid_x = (this.prevX + this.size)/2;
                const selfMid_y = (this.prevY + this.size)/2;
                const colliderMid_x = (otherball.prevX + otherball.size)/2;
                const colliderMid_y = (otherball.prevY + otherball.size)/2;
                let collider_Quadrant = "";

                //Finding which quadrant it's in >>>
                if(colliderMid_x < selfMid_x){ //Left quadrants
                        if(colliderMid_y < selfMid_y){
                                //Left, Top Quadrant
                                collider_Quadrant = "Left, Top";
                        }
                        else if(selfMid_y < colliderMid_y){
                                //Left, Bottom Quadrant
                                collider_Quadrant = "Left, Bottom";
                        }
                }

                else if(selfMid_x < colliderMid_x){ //Right quadrants
                        if(colliderMid_y < selfMid_y){
                                //Right, Top Quadrant
                                collider_Quadrant = "Right, Top";
                        }
                        else if(selfMid_y < colliderMid_y){
                                //Right, Bottom Quadrant
                                collider_Quadrant = "Right, Bottom";
                        }
                }
                //<<< Finding which quadrant it's in

                //In case the objects' middle points are perfectly on the same axis >>>
                if(colliderMid_x == selfMid_x && colliderMid_y != selfMid_y){
                        console.log("Collision coming from: Top");
                        return "Top";
                }
                if(colliderMid_y == selfMid_y && colliderMid_x != selfMid_x){
                        
                        if (otherball.x < this.x){
                                console.log("Collision coming from: Left");
                                return "Left";
                        }
                        else if(this.x < otherball.x){
                                console.log("Collision coming from: Right");
                                return "Right";
                        }
                }

                //Determining direction with it's quardrant
                if(collider_Quadrant == "Left, Top"){
                        //Top Collision >>>
                        if((otherball.prevX + otherball.size) > this.prevX && (otherball.prevY + otherball.size) < this.prevY){
                                console.log("Collision coming from: Top");
                                return "Top";
                        }
                        //<<< Top Collision
                        //Right Collision >>>
                        else if((otherball.prevX + otherball.size) < this.prevX && (otherball.prevY + otherball.size) > this.prevY){
                                console.log("Collision coming from: Left");
                                return "Left";
                        }
                        //<<< Right Collision
                        //Catch corner collision >>>
                        else if((otherball.prevX + otherball.size) == this.prevX && (otherball.prevY + otherball.size) == this.prevY){
                                console.log("Corner Collision. Prioritized to Top");
                                return "Top";
                        }
                        ///<<< Catch corner collision
                }
                else if(collider_Quadrant == "Left, Bottom"){
                        //This quadrant might not need a Bottom Collision since it's checking objects from the lowest y
                        console.log("Collision Direction: Left");
                        return "Left";
                }
                else if(collider_Quadrant == "Right, Top"){
                        //Top Collision >>>
                        if(otherball.prevX < (this.prevX+this.size) && (otherball.prevY + otherball.size) < this.prevY){
                                console.log("Collision coming from: Top");
                                return "Top";
                        }
                        //<<< Top Collision
                        ///Right Collision >>>
                        else if(otherball.prevX > (this.prevX+this.size) && (otherball.prevY + otherball.size) > this.prevY){
                                console.log("Collision coming from: Right");
                                return "Right";
                        }
                        ///<<< Right Collision
                        ///Catch corner collision >>>
                        else if(otherball.prevX == (this.prevX+this.size) && (otherball.prevY + otherball.size) == this.prevY){
                                console.log("Corner Collision. Prioritized to Top");
                                return "Top";
                        }
                        //<<< Catch corner collision
                }
                else if(collider_Quadrant == "Right, Bottom"){
                        //This quadrant might not need a Bottom Collision since it's checking objects from the lowest y
                        console.log("Collision Direction: Right");
                        return "Right";                
                }
                
        }

        FixCollision(otherball){
                //Pushes other ball out of it's self
                const collision_Dir = this.FindCollisionDir(otherball);
                console.log(`FixCollision passed thru, with collision_Dir: ${collision_Dir}.`);
                if(collision_Dir == "Top"){
                        let yOverLap = (otherball.y + otherball.size) - this.y;
                        otherball.y -= yOverLap;
                        if(this.velocityY == 0){
                                otherball.bottomCollided = true;
                        }
                }
                else if(collision_Dir == "Right"){
                        let xOverLap = (this.x + this.size) - otherball.x;
                        otherball.x += xOverLap;
                }
                else if(collision_Dir == "Left"){
                        let xOverLap = (otherball.x + otherball.size) - this.x;
                        otherball.x -= xOverLap;
                }
                this.isOverlapped = false;
                otherball.isOverlapped = false;
        }


}