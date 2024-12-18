import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import PostComponent from '../../components/PostComponent/Post';
import {likePost} from '../../services/postService';

jest.mock('../../services/postService', () => ({
    fetchPostComments: jest.fn().mockResolvedValue([]),
    likePost: jest.fn(),
    unlikePost: jest.fn(),
    postComment: jest.fn()
}));

const mockPost = {
    _id: '1',
    author: {
        f_name: 'John',
        l_name: 'Doe',
        img_link: '/avatar.png',
        position: 'Developer',
        department: 'Engineering'
    },
    content: 'This is a test post',
    mediaLinks: [],
    attachments: [],
    likes: 0,
    comments: []
};

describe('PostComponent', () => {
    beforeEach(() => {
        localStorage.setItem('token', 'mock-token');
    });

    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('renders post content correctly', async () => {
        render(<PostComponent post={mockPost} mode="default"/>);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Developer - Engineering')).toBeInTheDocument();
        expect(screen.getByText('This is a test post')).toBeInTheDocument();
        await screen.findByText('0 Comments');
    });

    test('renders post avatar correctly', async () => {
        render(<PostComponent post={mockPost} mode="default"/>);
        expect(screen.getByAltText("John Doe's Avatar")).toHaveAttribute('src', '/avatar.png');
        await screen.findByText('0 Comments');
    });

    test('like post', async () => {
        likePost.mockResolvedValueOnce();
        render(<PostComponent post={mockPost} mode="default"/>);

        await screen.findByText('0 Comments');

        const likeButton = screen.getByRole('button', {
            name: /like icon/i
        });

        fireEvent.click(likeButton);

        await waitFor(() => {
            expect(likePost).toHaveBeenCalledTimes(1);
        });
    });
});
