
function Swept_AABB_Collision_Check(MovingObject, StaticObject, deltaT){

    //Relative velocity = px/frame length. It's also the predicted position after velocity has been applied
    const relative_velocityX = MovingObject.x * deltaT;
    const relative_velocityY = MovingObject.y * deltaT;

    function GetAxisTimes(relative_velocity, moving_MaxPosition, moving_MinPosition, static_MaxPosition, static_MinPosition){
        if(relative_velocity === 0){console.log("Caught anomoly case 1"); return null }

        if(relative_velocity > 0){
            return {
                entryTime: (static_MinPosition - moving_MaxPosition)/relative_velocity,
                exitTime: (static_MaxPosition - moving_MinPosition)/relative_velocity
            };
        }
        else{
            return {
                entryTime: (static_MaxPosition - moving_MinPosition)/relative_velocity,
                exitTime: (static_MinPosition - moving_MaxPosition)/relative_velocity
            }
        }
    }

    const xTimes = GetAxisTimes(relative_velocityX, MovingObject.x, MovingObject.x2, StaticObject.x, StaticObject.x2, deltaT);
    const yTimes = GetAxisTimes(relative_velocityY, MovingObject.y, MovingObject.y2, StaticObject.x, StaticObject.x2, deltaT);

    const entryTime = Math.max(xTimes.entryTime, yTimes.entryTime); //The longer one would cover time for the shorter one
    const exitTime = Math.min(xTimes.exitTime, yTimes.exitTime);
    
    //No collision within this frame
    if (entryTime > exitTime || entryTime < 0 || entryTime > 1){
        return null;
    }

    return {entryTime, exitTime};
}