import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import UserPostTracker from '../../components/UserPostTracker/UserPostTracker';
import {fetchUserPosts} from '../../services/postService';

jest.mock('../../services/postService');

const mockPosts = [
    {
        _id: '1',
        content: 'First post content',
        timestamp: '2023-01-01T00:00:00Z',
        likes: 10,
        comments: 5,
        mediaLinks: ['https://example.com/image1.jpg'],
        author: {f_name: 'John', l_name: 'Doe'}
    },
    {
        _id: '2',
        content: 'Second post content',
        timestamp: '2023-01-02T00:00:00Z',
        likes: 20,
        comments: 10,
        mediaLinks: [],
        author: {f_name: 'Jane', l_name: 'Doe'}
    }
];

describe('UserPostTracker Component', () => {
    beforeEach(() => {
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('employee', JSON.stringify({_id: '1'}));
        fetchUserPosts.mockResolvedValue(mockPosts);
    });

    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('renders user post tracker correctly', async () => {
        render(<UserPostTracker/>);
        await waitFor(() => expect(screen.getByText('Posts')).toBeInTheDocument());
    });

    test('fetches and displays user posts', async () => {
        render(<UserPostTracker/>);
        await waitFor(() => {
            expect(screen.getByText('First post content...')).toBeInTheDocument();
            expect(screen.getByText('Second post content...')).toBeInTheDocument();
        });
    });

    test('handles search input change', async () => {
        render(<UserPostTracker/>);
        await waitFor(() => expect(screen.getByPlaceholderText('Search for a post...')).toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText('Search for a post...'), {target: {value: 'First'}});
        expect(screen.getByPlaceholderText('Search for a post...')).toHaveValue('first');
        expect(screen.queryByText('Second post content...')).not.toBeInTheDocument();
    });

    test('opens and closes post modal', async () => {
        render(<UserPostTracker/>);
        await waitFor(() => expect(screen.getByText('First post content...')).toBeInTheDocument());

        fireEvent.click(screen.getByText('First post content...'));
        await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());

        fireEvent.click(screen.getByText('✖'));
        await waitFor(() => expect(screen.queryByText('John Doe')).not.toBeInTheDocument());
    });
});
