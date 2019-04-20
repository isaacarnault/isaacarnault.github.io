<SCRIPT>
function passWord() {
var testV = 1;
var pass1 = prompt('Please Enter Your Password',' ');
while (testV < 3) {
if (!pass1)
history.go(-1);
if (pass1.toLowerCase() == "letmein") {
alert('You Got it Right!');
window.open('protectpage.html');
break;
}
testV+=1;
var pass1 =
prompt('Access Denied - Password Incorrect, Please Try Again.','Password');
}
if (pass1.toLowerCase()!="password" & testV ==3)
history.go(-1);
return " ";
}
</SCRIPT>
<CENTER>
<FORM style="height: 100%;
position: fixed;
z-index: 2020;
background: white;
width: 100%;
vertical-align: middle;
padding-top: 10%;
}">
<input type="button" value="Enter Protected Area" onClick="passWord()">
</FORM>
</CENTER>
