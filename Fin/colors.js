var Links = {
    setColor: function(color){
        var alist = document.querySelectorAll('a');
        var i = 0;
        while(i<alist.length){
            alist[i].style.color = color;
            i = i+1;
        }
    }
}

var Body = {
    setColor: function (color){
        document.querySelector('body').style.color = color;
    },
    setBackGroundColor: function(color){
        document.querySelector('body').style.backgroundColor = color;
    }
}

function nightDayHandler(self){
    // 이렇게 var이라는 변수를 통해서 더 간결하게 표현 가능
    var target = document.querySelector('body');
    // id를 사용해서 querySelector 내부에 #id .value를 사용해서 값을 찾을 수 있다.
    if(self.value === 'night'){
        Body.setBackGroundColor('black');
        Body.setColor('white');
        self.value = 'day'
        Links.setColor('powderblue');
        
    }
    else{
        Body.setBackGroundColor('white');
        Body.setColor('black');
        self.value = 'night'
        Links.setColor('blue');
    }
}