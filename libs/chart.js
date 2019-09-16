function LineBuffer(size)
{
    var i;
    this.time = 0;
    this.points = [];
    for (i = 0; i < size; i++)
    {
    	this.points.push(0);
    }
    
    this.addValue = function(value)
    {
      this.points[this.time] = value;
      this.time = (this.time + 1) % this.points.length;
    }
}

function LineChart(id, scale, offset)
{
    if (scale === undefined) scale = 30;
    if (offset === undefined) offset = 50;
    this.scale = scale;
    this.offset = offset;
    this.canvas = document.getElementById( id );
    this.plot = this.canvas.getContext('2d');    
    this.clear = function()
    {
      this.plot.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    this.stroke = function(points, style)
    {
      var i;
      var xStep = this.canvas.width / points.length;
      this.plot.beginPath();
      this.plot.moveTo(xStep, this.offset);
      for (i = 0; i < points.length; i++)
      {
        this.plot.lineTo(xStep * i, this.offset + points[i] * this.scale);
      }
      this.plot.strokeStyle = style;
      this.plot.stroke();
    }
}