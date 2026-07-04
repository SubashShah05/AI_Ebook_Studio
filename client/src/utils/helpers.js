export const triggerToast = (message, type = 'success') => {
  const div = document.createElement('div');
  div.className = type === 'success' ? 'toast-success' : 'toast-error';
  div.innerText = message;
  document.body.appendChild(div);
  setTimeout(() => {
    div.remove();
  }, 3000);
};