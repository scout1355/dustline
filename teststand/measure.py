import numpy as np, wave, sys
from scipy.signal import spectrogram
def load(p):
    w=wave.open(p); n=w.getnframes(); d=np.frombuffer(w.readframes(n),dtype=np.int16).astype(float)/32768; w.close(); return d
def stats(d,sr=44100):
    env=np.convolve(np.abs(d),np.ones(220)/220,'same')
    att=np.argmax(env>=env.max()*.7)/sr*1000
    last=np.where(env>env.max()*.05)[0]; dur=(last[-1]-last[0])/sr*1000
    f,t,S=spectrogram(d,sr,nperseg=1024,noverlap=768); P=S.sum(1); P/=P.sum()
    b=lambda a,c:P[(f>=a)&(f<c)].sum()*100
    loud=S.sum(0); act=loud>loud.max()*.05
    cent=(f[:,None]*S).sum(0)/np.maximum(S.sum(0),1e-12)
    # «зернистость»: как сильно меняется громкость от миллисекунды к миллисекунде
    e1=np.convolve(np.abs(d),np.ones(44)/44,'same'); e10=np.convolve(np.abs(d),np.ones(441)/441,'same')
    m=e10>e10.max()*.1; grit=np.mean(np.abs(e1[m]-e10[m])/np.maximum(e10[m],1e-9))
    return dict(dur=dur,att=att,lo=b(0,500),mid=b(500,1500),hi=b(1500,22050),c0=cent[act][:3].mean(),c1=cent[act][-3:].mean(),grit=grit)
if __name__=='__main__':
    for p in sys.argv[1:]:
        s=stats(load(p))
        print(f"{p:22s} длина {s['dur']:4.0f} мс | атака {s['att']:4.0f} | <500 Гц {s['lo']:3.0f}% | 0.5-1.5к {s['mid']:3.0f}% | >1.5к {s['hi']:3.0f}% | центр {s['c0']:5.0f}→{s['c1']:5.0f} | зернистость {s['grit']:.2f}")
