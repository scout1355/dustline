import numpy as np, wave
SR=44100
rng=np.random.default_rng(7)
def grain(n,bright):
    """микрощелчок: короткий всплеск шума с резким входом; яркость — через разность отсчётов"""
    g=rng.standard_normal(n)
    if bright>0: g=g-bright*np.concatenate([[0],g[:-1]])
    e=np.exp(-np.arange(n)/max(1,n*.28)); e[:2]*=np.array([.4,.8])[:min(2,n)]
    return g*e
def render(dur, density, slaps, bright=.9, lp_path=None, amp_path=None, glen=(.0004,.0026), lpf=None, slap_lp=None, wet=None, tilt=None):
    """density(t)->щелчков в секунду; slaps=[(t, длина мс, сила)]; lp_path(t)->частота среза или None"""
    n=int(SR*dur); out=np.zeros(n)
    t=0.0
    while t<dur:
        rate=max(1.0,density(t)); t+=rng.exponential(1/rate)
        if t>=dur: break
        L=int(SR*rng.uniform(*glen)); i=int(t*SR)
        a=rng.uniform(.15,1.0)**2*(amp_path(t) if amp_path else 1)
        seg=grain(L,bright)*a; e=min(n,i+L); out[i:e]+=seg[:e-i]
    for (ts,ms,s) in slaps:
        L=int(SR*ms/1000); i=int(ts*SR); g=globals()['rng'].standard_normal(L)
        if slap_lp:      # шлепок глуше щелчков — он даёт «тело» звука
            a=np.exp(-2*np.pi*slap_lp/SR); y=np.zeros(L); p=0
            for k in range(L): p=(1-a)*g[k]+a*p; y[k]=p
            g=y*3
        env=np.minimum(1,np.arange(L)/(SR*.0015))*np.exp(-np.arange(L)/(L*.35))
        e=min(n,i+L); out[i:e]+=(g*env*s)[:e-i]
    if wet:            # влажная полоса: тот же шум сквозь резонатор, частота гуляет во времени
        f0,q,mix=wet; y=np.zeros(n); b1=b2=a1=a2=0.0
        for k in range(n):
            fc=f0(k/SR) if callable(f0) else f0
            w0=2*np.pi*fc/SR; al=np.sin(w0)/(2*q); c=np.cos(w0)
            B0,B2,A0,A1,A2=al,-al,1+al,-2*c,1-al
            x=out[k]; yk=(B0*x+B2*b2-A1*a1-A2*a2)/A0
            b2,b1=b1,x; a2,a1=a1,yk; y[k]=yk
        out=out*(1-mix)+y*mix*3.2
    if tilt:           # наклон спектра: верх плавно спадает, как в живой записи
        a=np.exp(-2*np.pi*tilt/SR); y=np.zeros(n); p1=p2=0
        for k in range(n): p1=(1-a)*out[k]+a*p1; p2=(1-a)*p1+a*p2; y[k]=p2
        out=y*1.6
    if lpf:            # общий срез верха: убирает шипение
        a=np.exp(-2*np.pi*lpf/SR); y=np.zeros(n); p=0
        for k in range(n): p=(1-a)*out[k]+a*p; y[k]=p
        out=y
    if lp_path is not None:        # срез, который со временем опускается: звук «тяжелеет»
        y=np.zeros(n); p1=0; p2=0
        for k in range(n):   # два каскада — срез круче, звук правда «темнеет»
            fc=lp_path(k/SR); a=np.exp(-2*np.pi*fc/SR)
            p1=(1-a)*out[k]+a*p1; p2=(1-a)*p1+a*p2; y[k]=p2
        out=y*2.2
    return out/ max(1e-9,np.abs(out).max())*.9
def save(path,d):
    w=wave.open(path,'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(d,-1,1)*32767).astype(np.int16).tobytes()); w.close()
