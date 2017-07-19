if exists("g:loaded_sideswipe")
  finish
endif
let g:loaded_sideswipe = 1

function! sideswipe#GetList()
  echom "Test"
endfunction

command SSGetList :call sideswipe#GetList()
