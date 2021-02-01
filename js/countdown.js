var end = new Date('03/3/2021 6:1 PM');

    var _second = 1000;
    var _minute = _second * 60;
    var _hour = _minute * 60;
    var _day = _hour * 24;
    var timer;

    function showRemaining() {
        var now = new Date();
        var distance = end - now;
        if (distance < 0) {

            clearInterval(timer);
            document.getElementById('countdown').innerHTML = 'EXPIRED!';

            return;
        }
        var days = Math.floor(distance / _day);
        var hours = Math.floor((distance % _day) / _hour);
        var minutes = Math.floor((distance % _hour) / _minute);
        var seconds = Math.floor((distance % _minute) / _second);

        document.getElementById('countdown').innerHTML = 'SEASON ONE ENDS IN ';
        document.getElementById('countdown').innerHTML += days + 'DAYS ';
        document.getElementById('countdown').innerHTML += hours + 'HRS ';
        document.getElementById('countdown').innerHTML += minutes + 'MINS ';
        document.getElementById('countdown').innerHTML += seconds + 'SECS';
    }

    timer = setInterval(showRemaining, 1000);
