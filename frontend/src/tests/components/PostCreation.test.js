import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import PostCreation from '../../components/PostCreation/PostCreation';
import {createPost} from '../../services/postService';

jest.mock('../../services/postService');

const mockUser = {
    name: 'Bobr Bobrovich Doe',
    img_link: '/avatar.png'
};

describe('PostCreation Component', () => {
    beforeEach(() => {
        localStorage.setItem('token', 'mock-token');
    });

    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('renders post creation box correctly', () => {
        render(<PostCreation user={mockUser}/>);
        expect(screen.getByText("What's on your mind, Bobr Bobrovich Doe?")).toBeInTheDocument();
        expect(screen.getByAltText('User Avatar')).toHaveAttribute('src', '/avatar.png');
    });

    test('opens and closes post dialog', () => {
        render(<PostCreation user={mockUser}/>);
        fireEvent.click(screen.getByText("What's on your mind, Bobr Bobrovich Doe?"));
        expect(screen.getByPlaceholderText("What's on your mind, Bobr Bobrovich Doe?")).toBeInTheDocument();
        fireEvent.click(screen.getByAltText('Close button'));
        expect(screen.queryByPlaceholderText("What's on your mind, Bobr Bobrovich Doe?")).not.toBeInTheDocument();
    });

    test('adds and removes media links', () => {
        render(<PostCreation user={mockUser}/>);
        fireEvent.click(screen.getByText("What's on your mind, Bobr Bobrovich Doe?"));
        const mediaInput = screen.getByPlaceholderText('Paste image or video link here...');
        fireEvent.change(mediaInput, {target: {value: 'http://example.com/image.jpg'}});
        fireEvent.click(screen.getByText('Add Link'));
        expect(screen.getByAltText('Media 0')).toHaveAttribute('src', 'http://example.com/image.jpg');

        // Use getAllByAltText to get all elements with the alt text "Close button"
        const closeButtons = screen.getAllByAltText('Close button');
        fireEvent.click(closeButtons[1]); // Click the second close button (for media link)

        expect(screen.queryByAltText('Media 0')).not.toBeInTheDocument();
    });

    test('creates a post successfully', async () => {
        createPost.mockResolvedValueOnce();
        render(<PostCreation user={mockUser}/>);
        fireEvent.click(screen.getByText("What's on your mind, Bobr Bobrovich Doe?"));
        const postTextarea = screen.getByPlaceholderText("What's on your mind, Bobr Bobrovich Doe?");
        fireEvent.change(postTextarea, {target: {value: 'This is a test post'}});
        fireEvent.click(screen.getByText('Post'));
        await waitFor(() => expect(createPost).toHaveBeenCalledTimes(1));
    });
});
