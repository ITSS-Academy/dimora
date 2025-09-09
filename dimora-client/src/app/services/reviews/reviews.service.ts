import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ReviewModel } from '../../models/review.models';

@Injectable({
  providedIn: 'root',
})
export class ReviewsService {
  constructor(private http: HttpClient) {}

  createReview(review: any, idToken: string) {
    return this.http.post<ReviewModel>(`${environment.apiUrl}reviews`, review, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
  }

  getReviewList(roomId: string) {
    return this.http.get<ReviewModel[]>(
      `${environment.apiUrl}reviews/room/${roomId}`
    );
  }
}
