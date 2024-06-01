import React, { useState } from 'react';
import axios from 'axios';
import './CommentPopup.css';

const CommentPopup = ({ locationId }) => {
  const [commentText, setCommentText] = useState('');

  const handleAddComment = async () => {
    const newComment = {
      // menambahkan komentar (variabel content harus sama dengan backend)
      content: commentText,
    };

    try {
      const response = await axios.post(`http://103.178.153.251:3333/locations/${locationId}/comments`, newComment);

      console.log('Komentar berhasil ditambahkan:', response.data);

      setCommentText('');
      window.location.reload();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="comment-popup">
      <div className="comment-form">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Tambah komentar..."
        />
        <button onClick={handleAddComment}>Tambah</button>
      </div>
    </div>
  );
};

export default CommentPopup;
