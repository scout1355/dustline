import proto
from proto import *
import numpy as np
def goop():
    proto.rng=np.random.default_rng(101)
    dens=lambda t: 90+1000*np.exp(-((t-.19)/.07)**2) + (640*np.exp(-(t-.19)/.26) if t>.19 else 0)
    amp=lambda t: .35+.65*np.exp(-((t-.19)/.09)**2) if t<.19 else .25+.75*np.exp(-(t-.19)/.10)
    lp=lambda t: 8200 if t<.19 else 6200*np.exp(-(t-.19)*3.0)+2200
    return render(.66,dens,[(.185,22,1.3),(.13,10,.6)],bright=.35,amp_path=amp,glen=(.0012,.005),lp_path=None,slap_lp=None,
                  wet=(lambda t: 2600 if t<.19 else 2600*np.exp(-(t-.19)*1.8)+900,2.2,.45),tilt=None,lpf=None) if False else render(.66,dens,[(.185,22,1.3),(.13,10,.6)],bright=.35,amp_path=amp,glen=(.0012,.005),lp_path=lp,slap_lp=None,wet=(lambda t: 2600 if t<.19 else 2600*np.exp(-(t-.19)*1.8)+900,2.2,.45))
def splat():
    proto.rng=np.random.default_rng(202)
    c=[(.035,.012,1.7),(.10,.018,2.6),(.165,.010,1.0)]
    dens=lambda t: 40+sum(1500*np.exp(-((t-a)/.011)**2) for a,_,_ in c)
    lp=lambda t: 7600*np.exp(-t*6.5)+2400
    return render(.22,dens,[(a,L*1000,s) for a,L,s in c],bright=.5,glen=(.0008,.0035),lp_path=lp,slap_lp=None,wet=(3000,2.0,.4))
def hive():
    proto.rng=np.random.default_rng(303)
    dens=lambda t: 60+1300*min(1,max(0,(t-.08)/.17))*(1 if t<.46 else np.exp(-(t-.46)/.09))
    amp=lambda t: min(1,max(.15,(t-.05)/.2))*(1 if t<.46 else np.exp(-(t-.46)/.12))
    lp=lambda t: 14000*np.exp(-t*4.4)+700
    return render(.68,dens,[(.255,26,1.0),(.34,16,.7)],bright=.5,lp_path=lp,amp_path=amp,glen=(.0009,.0038),slap_lp=4200,wet=(lambda t: 3400*np.exp(-t*2.6)+650,1.8,.5))
for name,fn in (('goop',goop),('splat',splat),('hive',hive)): save(f'my_{name}.wav',fn())
