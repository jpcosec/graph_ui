import sys, os, runpy
log=open(sys.argv[1],'a',buffering=1); serve=sys.argv[2]; port=sys.argv[3]
def hook(ev,args):
    if ev=='open':
        p=args[0]
        if isinstance(p,int): return
        try: p=os.fsdecode(p)
        except Exception: return
        flags=args[2] if len(args)>2 else None
        log.write(p+'\t'+os.path.realpath(p)+'\n')
sys.addaudithook(hook)
sys.argv=[serve,port]
runpy.run_path(serve,run_name='__main__')
