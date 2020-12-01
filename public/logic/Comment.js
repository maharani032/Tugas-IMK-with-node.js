var Name, Comment, Doc, HeaderName, Text;

$('#add-comment').on('submit', function (e) {
    e.preventDefault();
    Name = $('#Nama').val();
    Comment = $('#Komentar').val();

    Doc = document.createElement('div');
    Doc.className = 'komen';

    HeaderName = document.createElement('h3');
    HeaderName.textContent = Name;

    Text = document.createElement('p');
    Text.textContent = Comment;

    Doc.appendChild(HeaderName);
    Doc.appendChild(Text);

    document.getElementById('comment-list').appendChild(Doc);
    
    

  

})