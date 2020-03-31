var Node = function(x, y, n)
{
	this.neuron = n;
	this.x = x;
	this.y = y;
	
	this.update = function(x, y)
	{
		
	}
}

var StaticNode = function(x, y, n)
{
	this.neuron = n;
	this.x = x;
	this.y = y;
	
	this.update = function(x, y, i)
	{
		
	}
}

var Edge = function(n1, n2)
{
	this.node1 = n1;
	this.node2 = n2;
}