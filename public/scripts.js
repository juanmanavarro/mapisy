document.getElementById('try-demo').addEventListener('click', () => {
  const curlCommand = document.getElementById('curl-command').innerText;

  navigator.clipboard.writeText(curlCommand)
      .then(() => {
          alert('Command copied to clipboard!\n\nExecute it in your terminal to see the marker on the map.');
      })
      .catch(err => {
          console.error('Error al copiar: ', err);
      });
});
