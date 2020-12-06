/*global variables*/
let cols=6,rows=4;
let imgAmount=cols*rows/4;
let imgList=[];
let pairImg=[];
let pairNode=[];
let arrayToCheck=[];
let timeRemain=121;
let isCountingTime=true;
let sourceImg=`girls`;
let audioGame=new Audio('https://audio-previews.elements.envatousercontent.com/files/72540162/preview.mp3');
audioGame.muted=false;
let idCountTime;

/*-----------------------------------------------------*/


function creatNewGame()
{
    clearInterval(idCountTime);
    function countTime()
    {
        idCountTime=setInterval(function(){if(isCountingTime) timeRemain-=1;if(timeRemain==0) {loseGame();isCountingTime=false;clearInterval(idCountTime)};document.getElementById('timeCounter').innerHTML=`Time: ${timeRemain} seconds`;},1000);
    }
    let audio_=new Audio('https://audio-previews.elements.envatousercontent.com/files/136199140/preview.mp3');
    audio_.play();
    audioGame.play();
    isCountingTime=true;
    countTime();
    let lever= document.getElementById('lever').value;
    if(lever==`0`)
    {
        cols=6;
        rows=4;
        timeRemain=26;
        imgAmount=cols*rows/2;
    }
    else if(lever==`1`)
    {
        cols=14;
        rows=6;
        timeRemain=121;
        imgAmount=cols*rows/4;
    }
    else if(lever==`2`)
    {
        cols=16;
        rows=7;
        timeRemain=181;
        imgAmount=cols*rows/4;
    }
    sourceImg=document.getElementById('image').value;
    function setImgList()
    {
        imgList=[];
        let id=0;
        for(let i=0;i<rows;i++)
        {
            for(let j=0;j<cols;j++)
            {
                imgList.push(`${id}.jpg`)
                id+=1;
                if(id==imgAmount) id=0;
            }
        }
    }
    function mixImgList()
    {
        for(let i=0;i<rows*cols;i++)
        {
            let index=Math.floor(Math.random()*rows*cols);
            let tmp=imgList[i];
            imgList[i]=imgList[index];
            imgList[index]=tmp;
        }
    }
    function setArrayToCheck()
    {
        arrayToCheck=[];
        for(let i=0;i<rows+2;i++)
        {
            let arrayToCheckRow=[];
            for(let j=0;j<cols+2;j++)
            {
                if(i==0 || i==(rows+2)-1) arrayToCheckRow.push(0);
                else
                {
                    if(j==0 || j==(cols+2)-1) arrayToCheckRow.push(0);
                    else arrayToCheckRow.push(1);
                }
            }
            arrayToCheck.push(arrayToCheckRow);
        }
    }
    setImgList();
    mixImgList();
    setArrayToCheck();
    let content=`<table id="table">`
    for(let i=0;i<rows;i++)
    {
        let contentRow=`<tr>`;
        for(let j=0;j<cols;j++)
        {
            contentRow+=`<td onclick="selectImg(this,${i+1},${j+1})"><img class="box" src="${sourceImg}/${imgList[i*cols+j]}" alt="img"></td>`
        }
        contentRow+=`</tr>`
        content+=contentRow;
    }
    content+=`</table>`
    document.getElementById('main').innerHTML=content;
    destructurePairImg();
}
function select_unselectImg(node,x,y)//check if select 2 times a box (td tag), then append to pairImg, prepare to check same image and can ...
{
    if(pairImg.length==1 && pairImg[0][0]==x && pairImg[0][1]==y)
    {
        node.style.borderColor='black';
        pairImg=[];
        pairNode=[];
    }
    else
    {
        node.style.borderColor='lawngreen';
        pairImg.push([x,y]);
        pairNode.push(node);
    }
}
function getNode(x,y)
{
    return document.getElementsByTagName('tr')[x].getElementsByTagName('td')[y];
}
function merge(coordsList)
{
    for(let i=0;i<coordsList.length;i++)
    {
        let nodeFirst=getNode(coordsList[i][0]-1,coordsList[i][1]-1);
        let index=Math.floor(Math.random()*coordsList.length);
        let nodeSecond=getNode(coordsList[index][0]-1,coordsList[index][1]-1);
        let tmp=nodeFirst.firstChild.src;
        nodeFirst.firstChild.src=nodeSecond.firstChild.src;
        nodeSecond.firstChild.src=tmp;
    }
}
function destructurePairImg()
{
    if(pairNode.length>=2)
    {
        pairNode[0].style.borderColor='black';
        pairNode[1].style.borderColor='black';
        pairNode[0].innerHTML=``;
        pairNode[1].innerHTML=``;

        /*update arrayToCheck*/
        arrayToCheck[pairImg[0][0]][pairImg[0][1]]=0;
        arrayToCheck[pairImg[1][0]][pairImg[1][1]]=0;
        /*------------------------------------------------------------------------------------*/

        pairNode=[];
        pairImg=[];
        let audio=new Audio('https://audio-previews.elements.envatousercontent.com/files/235794905/preview.mp3');
        audio.play();
    }
    if(isWin())
    {
        winGame();
        return;
    }


    /*start check, do have any way to play more*/
    function checkNeedToMerge(coordsList)
    {
        let isNeedToMerge=true;

        /*------------------------------------------------------------------------------------*/

        for(let i=0;i<coordsList.length-1;i++)
        {
            for(let j=i+1;j<coordsList.length;j++)
            {
                let nodeFirst=getNode(coordsList[i][0]-1,coordsList[i][1]-1);
                let nodeSecond=getNode(coordsList[j][0]-1,coordsList[j][1]-1);
                if(nodeFirst.firstChild.src==nodeSecond.firstChild.src)
                {
                    let arr_=[];
                    let direction=[[1,0],[-1,0],[0,1],[0,-1]];
                    let keepTracing=true;
                    for(let i=0;i<arrayToCheck.length;i++)
                    {
                        let arr_Row=[];
                        for(let j=0;j<arrayToCheck[i].length;j++)
                        {
                            arr_Row.push(arrayToCheck[i][j]);
                        }
                        arr_.push(arr_Row);
                    }
                    arr_[coordsList[i][0]][coordsList[i][1]]=0;
                    arr_[coordsList[j][0]][coordsList[j][1]]=0;
                    function trace(A,B,coordsList)
                    {
                        if(keepTracing==false) return; //only run when does not already found path

                        /*each new position, push A coordinate*/
                        coordsList.push(A);
                        if(isThreeLine(coordsList)==false) return; // if the path more then 3 lines -> stop tracing
                        arr_[A[0]][A[1]]=2; // and set value in position =2
                        if(A[0]==B[0] && A[1]==B[1]) // if found
                        {
                            if(isThreeLine(coordsList)) // check if the path contain only 3 lines
                            {
                                keepTracing=false; // stop tracing when check==false
                                isNeedToMerge=false;

                                /*------------------------------------------------------------------------------------*/
                            }
                        }
                        else
                        {
                            let coordsList_=[]; // to save coordsList origin
                            for(let i=0;i<coordsList.length;i++)
                            {
                                coordsList_.push(coordsList[i]);
                            }
                            let arr_clone=[]; // to save the arr_ origin, when recursive, arr_ will change and effect recursive later

                            /*creat an array clone, and reset after each trace() function*/
                            for(let i=0;i<arr_.length;i++)
                            {
                                let arr_Row=[];
                                for(let j=0;j<arr_[i].length;j++)
                                {
                                    arr_Row.push(arr_[i][j]);
                                }
                                arr_clone.push(arr_Row);
                            }

                            /*find better direction for tracing*/
                            /*direction=betterDirection(A,B);*/
                            /*------------------------------------------------------------------------------------*/
                            for(let i=0;i<4;i++) // 4 loops because have 4 direction
                            {
                                if(A[0]+direction[i][0]>=0 && A[0]+direction[i][0]<rows+2 && A[1]+direction[i][1]>=0 && A[1]+direction[i][1]<cols+2)
                                {
                                    if(arr_[A[0]+direction[i][0]][A[1]+direction[i][1]]==0) trace([A[0]+direction[i][0],A[1]+direction[i][1]],B,coordsList);

                                    /*reset arr_ and coordsList by arr_clone created above*/
                                    arr_=[];
                                    for(let i=0;i<arr_clone.length;i++)
                                    {
                                        let arr_Row=[];
                                        for(let j=0;j<arr_clone[i].length;j++)
                                        {
                                            arr_Row.push(arr_clone[i][j]);
                                        }
                                        arr_.push(arr_Row);
                                    }
                                    coordsList=[];
                                    for(let i=0;i<coordsList_.length;i++)
                                    {
                                        coordsList[i]=coordsList_[i];
                                    }
                                }
                            }
                        }
                    }
                    trace(coordsList[i],coordsList[j],[]);
                }
            }
        }
        console.log(isNeedToMerge);
        return isNeedToMerge;
    }
    /*------------------------------------------------------------------------------------*/

    /*------------------------------------------------------------------------------------*/
    /*start check do need merge*/
    let nodeCoordsList=[];
    for(let i=0;i<arrayToCheck.length;i++)
    {
        for(let j=0;j<arrayToCheck[i].length;j++)
        {
            if(arrayToCheck[i][j]==1)
            {
                nodeCoordsList.push([i,j]);
            }
        }
    }

    while(checkNeedToMerge(nodeCoordsList))
    {
        merge(nodeCoordsList);
    }

    /*------------------------------------------------------------------------------------*/

}
function checkPairImgIsTheSame()
{
    if(pairNode[0].firstChild.src==pairNode[1].firstChild.src)
    {
        return true;
    }
    return false;
}
function tracePath()
{
    /*set 4 direction*/
    let direction=[[1,0],[-1,0],[0,1],[0,-1]];
    /*------------------------------------------------------------------------------------*/
    /*clone arr_ from arrToCheck*/
    let arr_=[];
    for(let i=0;i<arrayToCheck.length;i++)
    {
        let arr_Row=[];
        for(let j=0;j<arrayToCheck[i].length;j++)
        {
            arr_Row.push(arrayToCheck[i][j]);
        }
        arr_.push(arr_Row);
    }
    /*------------------------------------------------------------------------------------*/
    arr_[pairImg[0][0]][pairImg[0][1]]=0;
    arr_[pairImg[1][0]][pairImg[1][1]]=0;
    /*------------------------------------------------------------------------------------*/
    let check=true; //if found path, stop tracing
    /*------------------------------------------------------------------------------------*/
    /*trace function using recursive*/
    function trace(A,B,coordsList)
    {
        if(check==false) return; //only run when does not already found path

        /*each new position, push A coordinate*/
        coordsList.push(A);
        if(isThreeLine(coordsList)==false) return; // if the path more then 3 lines -> stop tracing
        arr_[A[0]][A[1]]=2; // and set value in position =2
        if(A[0]==B[0] && A[1]==B[1]) // if found
        {
            if(isThreeLine(coordsList)) // check if the path contain only 3 lines
            {
                check=false; // stop tracing when check==false
                destructurePairImg();

                /*------------------------------------------------------------------------------------*/
            }
        }
        else
        {
            let coordsList_=[]; // to save coordsList origin
            for(let i=0;i<coordsList.length;i++)
            {
                coordsList_.push(coordsList[i]);
            }
            let arr_clone=[]; // to save the arr_ origin, when recursive, arr_ will change and effect recursive later

            /*creat an array clone, and reset after each trace() function*/
            for(let i=0;i<arr_.length;i++)
            {
                let arr_Row=[];
                for(let j=0;j<arr_[i].length;j++)
                {
                    arr_Row.push(arr_[i][j]);
                }
                arr_clone.push(arr_Row);
            }

            /*find better direction for tracing*/
            /*direction=betterDirection(A,B);*/
            /*------------------------------------------------------------------------------------*/
            for(let i=0;i<4;i++) // 4 loops because have 4 direction
            {
                if(A[0]+direction[i][0]>=0 && A[0]+direction[i][0]<rows+2 && A[1]+direction[i][1]>=0 && A[1]+direction[i][1]<cols+2)
                {
                    if(arr_[A[0]+direction[i][0]][A[1]+direction[i][1]]==0) trace([A[0]+direction[i][0],A[1]+direction[i][1]],B,coordsList);

                    /*reset arr_ and coordsList by arr_clone created above*/
                    arr_=[];
                    for(let i=0;i<arr_clone.length;i++)
                    {
                        let arr_Row=[];
                        for(let j=0;j<arr_clone[i].length;j++)
                        {
                            arr_Row.push(arr_clone[i][j]);
                        }
                        arr_.push(arr_Row);
                    }
                    coordsList=[];
                    for(let i=0;i<coordsList_.length;i++)
                    {
                        coordsList[i]=coordsList_[i];
                    }
                }
            }
        }
    }
    /*------------------------------------------------------------------------------------*/
    trace(pairImg[0],pairImg[1],[]);
    if(pairNode.length>=2)
    {
        pairNode[0].style.borderColor='black';
        pairNode[1].style.borderColor='black';
        pairNode=[];
        pairImg=[];
    }

    /*------------------------------------------------------------------------------------*/

}
/*------------------------------------------------------------------------------------*/
function isThreeLine(coords)
{
    let changeDirection=0;
    for(let i=2;i<coords.length;i++)
    {
        if((coords[i][0]-coords[i-1][0] != coords[i-1][0]-coords[i-2][0]) || (coords[i][1]-coords[i-1][1] != coords[i-1][1]-coords[i-2][1])) changeDirection+=1;
    }
    if(changeDirection<=2) return true;
    else return false;
}
function selectImg(node,x,y)
{
    if(node.childNodes.length!=0)//if have any image in this box (td tag)->select this image
    {
        select_unselectImg(node,x,y);
        if(pairImg.length==2)
        {
            if(checkPairImgIsTheSame())
            {
                tracePath();
            }
            else
            {
                pairNode[0].style.borderColor='black';
                pairNode[1].style.borderColor='black';
                pairNode=[];
                pairImg=[];
            }
        }
    }
}
function creatOriginInterface()
{
    let audio_=new Audio('https://audio-previews.elements.envatousercontent.com/files/136199140/preview.mp3');
    audio_.play();
    let content=`<div><select name="lever" id="lever"><option value="0">Easy</option><option value="1">Medium</option><option value="2">Hard</option></select><select name="image" id="image"><option value="pikachu">Pikachu</option><option value="girls">Girls</option><option value="anime_girls">AnimeGirls</option></select><button onclick="creatNewGame()">Play</button></div>`;
    document.getElementById('main').innerHTML=content;
    document.getElementById('description').style.display=`none`;
    document.getElementById('main').style.display=`flex`;
}
function creatOriginInterfaceHasDescription()
{
    let audio_=new Audio('https://audio-previews.elements.envatousercontent.com/files/136199140/preview.mp3');
    audio_.play();
    let content=`<div><select name="lever" id="lever"><option value="0">Easy</option><option value="1">Medium</option><option value="2">Hard</option></select><select name="image" id="image"><option value="pikachu">Pikachu</option><option value="girls">Girls</option><option value="anime_girls">AnimeGirls</option></select><button onclick="creatNewGame()">Play</button></div>`;
    document.getElementById('main').innerHTML=content;
    document.getElementById('description').style.display=`flex`;
    document.getElementById('main').style.display=`none`;
}
function pauseContinue()
{
    let audio=new Audio('https://audio-previews.elements.envatousercontent.com/files/136199140/preview.mp3');
    audio.play();
    isCountingTime=!isCountingTime;
    let node_=document.getElementById('pause');
    node_.innerText=(node_.innerText=='Pause')?'Continue':'Pause';

    /*------------------------------------------------------------------------------------*/

    let node=document.getElementById('main');
    let nodeContent=node.innerHTML;
    if(node_.innerText==`Continue`)
    {
        document.getElementById('description').style.display=`flex`;
        document.getElementById('main').style.display=`none`;
    }
    else
    {
        document.getElementById('description').style.display=`none`;
        document.getElementById('main').style.display=`flex`;
    }
}
function loseGame()
{
    let audio=new Audio('https://audio-previews.elements.envatousercontent.com/files/281599793/preview.mp3');
    audio.play();
    document.getElementById('main').innerHTML=`<p style="font-size:100px;color:greenyellow;">Game Over</p>`;
    clearInterval(idCountTime);
}
function muteUnmute()
{
    let audio=new Audio('https://audio-previews.elements.envatousercontent.com/files/136199140/preview.mp3');
    audio.play();
    audioGame.muted=!audioGame.muted;
    document.getElementById('mute').innerText=(document.getElementById('mute').innerText==`Mute`)?`Unmute`:`Mute`;
}
function isWin()
{
    for(let i=0;i<rows;i++)
    {
        for(let j=0;j<cols;j++)
        {
            if(arrayToCheck[i][j]!=0) return false;
        }
    }
    return true;
}
function winGame()
{
    let audio_=new Audio('https://audio-previews.elements.envatousercontent.com/files/111184960/preview.mp3');
    audio_.play();
    document.getElementById('main').innerHTML=`<p style="font-size:100px;color:greenyellow;">You Win</p>`;
    clearInterval(idCountTime);
}
/*------------------------------------------------------------------------------------*/
function betterDirection(A,B)
{
    let dir=[[1,0],[-1,0],[0,1],[0,-1]]
    if(A[0]==B[0])
    {
        if(A[1]>B[1]) return [[0,-1],[1,0],[-1,0],[0,1]];
        else return [[0,1],[1,0],[-1,0],[0,-1]];
    }
    else if(A[0] != B[0])
    {
        if(A[0]>B[0])
        {
            if(A[1]>B[1])
            {
                return [[-1,0],[0,-1],[0,1],[1,0]];
            }
            else return [[-1,0],[0,1],[0,-1],[1,0]];
        }
        else if(A[0]<B[0])
        {
            if(A[1]>B[1])
            {
                return [[1,0],[0,-1],[0,1],[-1,0]];
            }
            else return [[1,0],[0,1],[0,-1],[-1,0]];
        }
    }

    /*------------------------------------------------------------------------------------*/
    return dir; // do not need but to be careful
}

