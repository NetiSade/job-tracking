import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import JobItem from '../JobItem';
import { Job } from '../../types';

const mockJob: Job = {
  id: '1',
  user_id: 'user123',
  company: 'Test Company',
  position: 'Software Engineer',
  status: 'wishlist',
  sort_order: 0,
  salary_expectations: '120k',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  comments: [],
};

describe('JobItem', () => {
  it('renders job details correctly', () => {
    const { getByText } = render(
      <JobItem 
        job={mockJob} 
        onEdit={() => {}} 
        onDelete={() => {}} 
        onViewComments={() => {}}
        onChangeStatus={() => {}}
        onDrag={() => {}}
        isDragging={false}
      />
    );

    expect(getByText('Test Company')).toBeTruthy();
    expect(getByText('Software Engineer')).toBeTruthy();
    expect(getByText(/120k/)).toBeTruthy();
  });

  it('calls onDelete when delete button is pressed', () => {
    const mockDelete = jest.fn();
    const { getByText } = render(
      <JobItem 
        job={mockJob} 
        onEdit={() => {}} 
        onDelete={mockDelete} 
        onViewComments={() => {}}
        onChangeStatus={() => {}}
        onDrag={() => {}}
        isDragging={false}
      />
    );

    fireEvent.press(getByText('Delete'));
    expect(mockDelete).toHaveBeenCalledWith('1');
  });
});
