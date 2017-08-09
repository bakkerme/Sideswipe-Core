if exists("g:loaded_sideswipe")
  finish
endif
let g:loaded_sideswipe = 1
let s:path = fnamemodify(resolve(expand('<sfile>:p')), ':h')

function! sideswipe#GetList()
  let l:currWin = winnr() 
  let s:file = expand('%')
  call sideswipe#CreateTreeWin()
  silent! execute "read !node " . s:path . "/../../deptools/index.js " . s:file
  call sideswipe#SwitchWindow('w',0,l:currWin)
endfunction

command SSGetList :call sideswipe#GetList()

function! sideswipe#CreateTreeWin()
   let splitLocation = "botright "
   let splitSize = 100

   if !exists('t:SSBufName')
     let t:SSBufName = 'ssbuf'
     silent! exec splitLocation . 'vertical ' .  splitSize . ' new'
     silent! exec "edit " .  t:SSBufName
     autocmd BufEnter *.js call sideswipe#GetList()
  else
    let wNum = sideswipe#FindWindow(t:SSBufName)
    call sideswipe#SwitchWindow("w",0,wNum)
    silent! exec "1,$d"
    call cursor(0,0)
  endif

  setlocal winfixwidth
  call sideswipe#SetCommonBufOptions()
endfunction

function! sideswipe#SetCommonBufOptions()
  setlocal noswapfile
  setlocal buftype=nofile
  setlocal bufhidden=hide
  setlocal nowrap
  setlocal foldcolumn=0
  setlocal foldmethod=manual
  setlocal nofoldenable
  setlocal nobuflisted
  setlocal nospell
  iabc <buffer>
endfunction

function! sideswipe#FindWindow(bufName)   
  let l:winnr = bufwinnr(a:bufName)    
  return l:winnr 
endfunction

function! sideswipe#SwitchWindow(action, ...)   
  let l:aucmd = 'noautocmd '   
  " if exists('a:1') && a:1 == 1     
  " else     
    " let l:aucmd = ''   
  " endif    
  if exists('a:2')     
    let l:winnr = a:2   
  else    
    let l:winnr = ''   
  endif    
  let l:wincmd = l:aucmd.l:winnr.'wincmd '.a:action   
  exec l:wincmd
endfunction
