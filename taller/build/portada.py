from PIL import Image, ImageDraw, ImageFont
F='/usr/share/fonts/truetype/google-fonts/Poppins-'
V={'jairo':('Jairo','asesor','#3f8f1f','#eef7e6'),'liliana':('Liliana','asesora','#c2246f','#fbe9f2'),'gladys':('Gladys','asesora','#d9530a','#fdeee3')}
prods=['colgenwell','vitamina-c','ashwagandha-ksm66','biotina','probioticos','maca']
for v,(n,t,col,bg) in V.items():
    W,H=1200,630; im=Image.new('RGB',(W,H),bg); d=ImageDraw.Draw(im)
    # productos a la derecha: 3x2 tarjetas 9:16
    cw,ch=150,267; x0,y0=W-3*cw-4*14+14,48
    for i,p in enumerate(prods):
        ph=Image.open(f'img/{p}.jpg').convert('RGB').resize((cw,ch))
        x=x0+(i%3)*(cw+14); y=y0+(i//3)*(ch+14)
        mask=Image.new('L',(cw,ch),0); ImageDraw.Draw(mask).rounded_rectangle((0,0,cw,ch),16,fill=255)
        im.paste(ph,(x,y),mask)
    ic=Image.open(f'iconos/{v}-512.png').convert('RGBA').resize((150,150))
    m=Image.new('L',(150,150),0);ImageDraw.Draw(m).ellipse((0,0,150,150),fill=255);im.paste(ic,(60,60),m)
    d.text((60,240),'Catálogo de',font=ImageFont.truetype(F+'Medium.ttf',40),fill='#2b2430')
    d.text((60,288),'bienestar natural',font=ImageFont.truetype(F+'Bold.ttf',52),fill='#2b2430')
    d.rounded_rectangle((60,385,540,465),22,fill=col)
    f2=ImageFont.truetype(F+'Bold.ttf',34); txt=f'Te atiende {n}'
    d.text((300,425),txt,font=f2,fill='white',anchor='mm')
    d.text((60,500),'+60 productos · Pide por WhatsApp',font=ImageFont.truetype(F+'Medium.ttf',28),fill='#2b2430')
    d.text((60,545),'Pagas cuando lo recibes',font=ImageFont.truetype(F+'Medium.ttf',28),fill=col)
    im.save(f'iconos/portada-{v}.jpg',quality=85)
print('ok')
