addComment={moveForm:function(e,t,n,m){var o=this;o.red();var i,d=o.I(e),r=o.I(n),c=o.I("cancel-comment-reply-link"),a=o.I("comment_parent"),l=o.I("comment_post_ID");if(d&&r&&c&&a)return o.respondId=n,m=m||!1,o.I("wp-temp-form-div")||(i=document.createElement("div"),i.id="wp-temp-form-div",i.style.display="none",r.parentNode.insertBefore(i,r)),d.parentNode.insertBefore(r,d.nextSibling),l&&m&&(l.value=m),a.value=t,c.style.display="",o.aed(),c.onclick=function(){var e=addComment;e.red();var t=e.I("wp-temp-form-div"),n=e.I(e.respondId);if(t&&n)return e.I("comment_parent").value="0",t.parentNode.insertBefore(n,t),t.parentNode.removeChild(t),this.style.display="none",this.onclick=null,e.aed(),!1},!1},I:function(e){return document.getElementById(e)},red:function(){if("undefined"!=typeof tinyMCE){var e=tinyMCE.get("comment");e&&!e.isHidden()?(this.mode="tmce",e.remove()):this.mode="html"}},aed:function(){"undefined"!=typeof tinyMCE&&("tmce"==this.mode?switchEditors.go("comment","tmce"):"html"==this.mode&&switchEditors.go("comment","html"))}},jQuery(function(e){e(".comment-reply-link").click(function(t){t.preventDefault();var n=e(this).data("onclick");n=n.replace(/.*\(|\)/gi,"").replace(/\"|\s+/g,""),n=n.split(",");var m=tinyMCE.get("comment");m&&m.execCommand("mceStartTyping"),tinymce.EditorManager.execCommand("mceRemoveControl",!0,"comment"),addComment.moveForm.apply(addComment,n),tinymce.EditorManager.execCommand("mceAddControl",!0,"comment")})});