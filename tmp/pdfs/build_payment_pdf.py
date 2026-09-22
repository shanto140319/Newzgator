from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from PIL import Image
from pypdf import PdfReader
base=Path('C:/Users/shant/Downloads')
out=Path('D:/projects/newzgator/output/pdf/payment-supporting-images.pdf')
items=[('5.jpeg','01  Customer photo','Photo supplied by the service provider.'),('7.jpeg','02  Profile details','Location information displayed on the profile.'),('6.jpeg','03  Profile: 84K followers','Reported by the provider as the earlier view.'),('2.jpeg','04  Initial conversation','Initial service and price discussion.'),('3.jpeg','05  Service and price discussion','25K followers / BDT 1,200 discussed.'),('8.png','06  Profile: 125K followers','Reported by the provider as the later view.'),('WhatsApp Image 2026-09-22 at 7.30.16 PM.jpeg','07  Payment follow-up','BDT 1,200 requested in the conversation.')]
W,H=1440,1710
c=canvas.Canvas(str(out),pagesize=(W,H))
c.setTitle('Private payment record - supporting images')
c.setAuthor('')
c.setFillColor(HexColor('#f1f5f9'));c.rect(0,0,W,H,fill=1,stroke=0)
c.setFillColor(HexColor('#10243a'));c.rect(0,H-155,W,155,fill=1,stroke=0)
c.setFillColor(HexColor('#a8c6df'));c.setFont('Helvetica-Bold',13);c.drawString(36,H-35,'PRIVATE PAYMENT RECORD  /  SUPPORTING IMAGES')
c.setFillColor(HexColor('#ffffff'));c.setFont('Helvetica-Bold',30);c.drawString(36,H-77,'Service payment follow-up')
c.setFont('Helvetica',16);c.drawString(36,H-110,'Amount claimed outstanding by the service provider: BDT 1,200')
c.setFont('Helvetica',12);c.drawString(36,H-136,'Seven supplied images, in the requested sequence. Read left to right, then continue on the second row.')
margin=36;gap=18;cw=(W-2*margin-3*gap)/4;ch=714
for i,(fn,title,desc) in enumerate(items):
 row=i//4;col=i%4;x=margin+col*(cw+gap);top=H-177-row*(ch+22);bottom=top-ch
 c.setFillColor(HexColor('#ffffff'));c.roundRect(x,bottom,cw,ch,8,fill=1,stroke=0)
 c.setFillColor(HexColor('#10243a'));c.setFont('Helvetica-Bold',13);c.drawString(x+12,top-24,title)
 c.setFillColor(HexColor('#526376'));c.setFont('Helvetica',9);c.drawString(x+12,top-41,desc)
 p=base/fn
 with Image.open(p) as im: iw,ih=im.size
 aw=cw-20;ah=ch-64;s=min(aw/iw,ah/ih);dw,dh=iw*s,ih*s
 c.drawImage(str(p),x+(cw-dw)/2,top-54-dh,width=dw,height=dh,mask='auto')
# Explanatory card in last cell
x=margin+3*(cw+gap);top=H-177-(ch+22)
c.setFillColor(HexColor('#e2eaf2'));c.roundRect(x,top-245,cw,245,8,fill=1,stroke=0)
c.setFillColor(HexColor('#10243a'));c.setFont('Helvetica-Bold',14);c.drawString(x+16,top-28,'Reading this record')
c.setFont('Helvetica',11)
lines=['84K to 125K is a displayed increase','of approximately 41K followers.','','The conversation discusses 25K','followers for BDT 1,200.','','The images alone do not establish','the source of all follower growth','or whether payment remains unpaid.','','Original image contents are retained.']
for j,line in enumerate(lines):c.drawString(x+16,top-52-j*16,line)
c.setFillColor(HexColor('#526376'));c.setFont('Helvetica',10);c.drawString(36,29,'Prepared for private payment resolution. Profile details and chronology have not been independently verified.')
c.drawRightString(W-36,29,'1 / 1')
c.save()
r=PdfReader(str(out));assert len(r.pages)==1
print(str(out));print('Pages:',len(r.pages));print('Embedded images:',len(r.pages[0].images))
try:
 import fitz
 d=fitz.open(out);d[0].get_pixmap(matrix=fitz.Matrix(0.9,0.9)).save('D:/projects/newzgator/tmp/pdfs/payment-preview.png')
 print('Preview rendered')
except ImportError:
 print('PyMuPDF unavailable')
