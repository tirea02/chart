
!function() {
    var path = document.location.pathname;
    var dir = /^.*\/([a-z]+)\//.exec(path)[1];
    var filename = path.substring(path.lastIndexOf('/')+1);

    window.onload = function() {
        d3.select('#version').text('v' + dc.version);
    };
}();