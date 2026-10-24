from PIL import Image, ImageDraw, ImageFont
F='/usr/share/fonts/truetype/google-fonts/Poppins-'
V={'jairo':('Jairo','asesor','#3f8f1f','#eef7e6'),'liliana':('Liliana','asesora','#c2246f','#fbe9f2'),'gladys':('Gladys','asesora','#d9530a','#fdeee3')}
prods=['colgenwell','vitamina-c','ashwagandha-ksm66','biotina','probioticos','maca']
fn=lambda w,s:ImageFont.truetype(F+w+'.ttf',s)
for v,(n,t,col,bg) in V.items():
    W,H=1080,1920; im=Image.new('RGB',(W,H),bg); d=ImageDraw.Draw(im)
    ic=Image.open(f'iconos/{v}-512.png').convert('RGBA').resize((170,170))
    m=Image.new('L',(170,170),0);ImageDraw.Draw(m).ellipse((0,0,170,170),fill=255);im.paste(ic,((W-170)//2,70),m)
    d.text((W/2,295),'Catálogo de',font=fn('Medium',56),fill='#2b2430',anchor='mm')
    d.text((W/2,372),'bienestar natural',font=fn('Bold',84),fill='#2b2430',anchor='mm')
    cw,ch,g=290,515,24; x0=(W-3*cw-2*g)//2; y0=450
    for i,p in enumerate(prods):
        ph=Image.open(f'img/{p}.jpg').convert('RGB').resize((cw,ch))
        mk=Image.new('L',(cw,ch),0); ImageDraw.Draw(mk).rounded_rectangle((0,0,cw,ch),24,fill=255)
        im.paste(ph,(x0+(i%3)*(cw+g),y0+(i//3)*(ch+g)),mk)
    y=y0+2*ch+g+62
    d.text((W/2,y),'+60 productos para energía, defensas,',font=fn('Medium',40),fill='#2b2430',anchor='mm')
    d.text((W/2,y+56),'descanso, belleza y más',font=fn('Medium',40),fill='#2b2430',anchor='mm')
    d.rounded_rectangle((140,y+180,W-140,y+290),55,fill=col)
    d.text((W/2,y+235),f'Te atiende {n}',font=fn('Bold',52),fill='white',anchor='mm')
    d.text((W/2,y+122),'Pide por WhatsApp · Pagas cuando lo recibes',font=fn('Medium',36),fill=col,anchor='mm')
    im.save(f'iconos/historia-{v}.jpg',quality=85)
print('ok')
