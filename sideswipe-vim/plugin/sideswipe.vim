if exists("g:loaded_sideswipe")
  finish
endif
let g:loaded_sideswipe = 1
let s:path = fnamemodify(resolve(expand('<sfile>:p')), ':h')

function! sideswipe#GetList()
  let s:file = expand('%')
  call sideswipe#CreateTreeWin()
  echom s:path
  execute "read !node " . s:path . "/../../deptools/index.js " . s:file
endfunction

command SSGetList :call sideswipe#GetList()

function! sideswipe#CreateTreeWin()
   let splitLocation = "botright "
   let splitSize = 100

   if !exists('t:SSBufName')
     let t:SSBufName = 'ssbuf'
     silent! exec splitLocation . 'vertical ' .  splitSize . ' new'
     silent! exec "edit " .  t:SSBufName
  else
    silent! exec splitLocation .  'vertical ' . splitSize . ' split'
    silent! exec "buffer " . t:SSBufName
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


