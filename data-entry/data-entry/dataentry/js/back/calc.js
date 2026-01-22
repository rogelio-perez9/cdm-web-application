function calcVolume(dimtype,qty,len,wid,hgt,dimcode,volcode,volume,voltype)
{
 var x1 = document.getElementById(qty).value;
 var x2 = document.getElementById(len).value;
 var x3 = document.getElementById(wid).value;
 var x4 = document.getElementById(hgt).value;
 var x5 = 0;
 var x6 = 0;
 var x7 = "T";
 var x8 = "I";
 var dt = document.getElementById(dimtype).value;
 var dc = document.getElementById(dimcode).value;
 var vc = document.getElementById(volcode).value;

 switch (dt) {
	 case 'T':
				x1 = 1;
				break;
	 }

 if (x1>0 && x2>0 && x3>0 && x4>0)
		{
		switch (dc) {
			case 'I':
					 switch (vc){
						 case 'CFT':
									x5 = (x1*x2*x3*x4)/1728;
									break;
						 case 'CBM':
									x5 = (x1*x2*x3*x4)/61023.8;
									break;
					 }
					 break;
		  case 'C':
					 switch (vc){
						 case 'CFT':
									x5 = (x1*x2*x3*x4)/28316.85;
									break;
						 case 'CBM':
									x5 = (x1*x2*x3*x4)/1000000;
									break;
					 }
					 break;
       }
		var x6 = x5.toFixed(3);
		document.getElementById(volume).value = x6;
		document.getElementById(voltype).value = x7;
		} else
		{
			document.getElementById(voltype).value = x8;
		}
}

function calcRev(qty,rate,per,total)
{
 var xQ = document.getElementById(qty).value;
 var xP = document.getElementById(per).value;
 var xR = document.getElementById(rate).value;
 var x3 = (xQ/xP)*xR;
 var x4 = x3.toFixed(2);
 var x4 = roundToTwo(x3);
 document.getElementById(total).value = x4;
}

function roundToTwo(num)
{
 return +(Math.round(num + "e+2") + "e-2");
}

