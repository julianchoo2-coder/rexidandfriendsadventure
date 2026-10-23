// Nivel 1: seis vigas inclinadas, escaleras completas/rotas, tambor de aceite y rutas de caída.
window.LEVEL1={width:448,height:512,platforms:[
{left:0,right:415,yLeft:176,yRight:176},
{left:32,right:448,yLeft:242,yRight:230},
{left:0,right:415,yLeft:296,yRight:308},
{left:32,right:448,yLeft:374,yRight:362},
{left:0,right:415,yLeft:428,yRight:440},
{left:0,right:448,yLeft:496,yRight:488}],
ladders:[
{x:365,upper:0},{x:185,upper:0,damaged:true},
{x:92,upper:1},{x:180,upper:1,damaged:true},
{x:342,upper:2},{x:250,upper:2,damaged:true},
{x:110,upper:3},{x:300,upper:3,damaged:true},
{x:350,upper:4},{x:180,upper:4,damaged:true}],
goalLadder:{x:146,goal:true},goalPlatform:{left:118,right:178,y:126},goal:{x:145},
oilDrum:{x:48,row:5},start:{x:365,row:5},barrelInterval:2.85,barrelSpeed:68,gravity:620};