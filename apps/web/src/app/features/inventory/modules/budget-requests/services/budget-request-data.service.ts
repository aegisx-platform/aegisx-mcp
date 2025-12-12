import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Assuming paths and types are correct from previous steps
import {
  BudgetRequest,
  BudgetRequestStatus,
} from '../types/budget-requests.types';

// Matching backend response structures
export interface StatsResponse {
  total: number;
  by_status: {
    [key in BudgetRequestStatus]: number;
  };
}

export interface PendingActionsResponse {
  pending: BudgetRequest[];
  count: number;
}

export interface RecentRequestsResponse {
  requests: BudgetRequest[];
  count: number;
}

@Injectable({
  providedIn: 'root',
})
export class BudgetRequestDataService {
  private http = inject(HttpClient);
  private readonly API_URL = '/inventory/budget/budget-requests';

  /**
   * Fetches aggregated statistics for budget requests.
   * Corresponds to: GET /inventory/budget/budget-requests/stats/total
   */
  getStats(filters: {
    fiscal_year?: number;
    department_id?: number;
  }): Observable<StatsResponse> {
    let params = new HttpParams();
    if (filters.fiscal_year) {
      params = params.set('fiscal_year', filters.fiscal_year.toString());
    }
    if (filters.department_id) {
      params = params.set('department_id', filters.department_id.toString());
    }
    return this.http.get<StatsResponse>(`${this.API_URL}/stats/total`, {
      params,
    });
  }

  /**
   * Fetches requests pending the current user's action.
   * Corresponds to: GET /inventory/budget/budget-requests/my-pending-actions
   */
  getMyPendingActions(): Observable<PendingActionsResponse> {
    return this.http.get<PendingActionsResponse>(
      `${this.API_URL}/my-pending-actions`,
    );
  }

  /**
   * Fetches the most recent budget requests.
   * Corresponds to: GET /inventory/budget/budget-requests/recent
   */
  getRecent(query: { limit?: number }): Observable<RecentRequestsResponse> {
    let params = new HttpParams();
    if (query.limit) {
      params = params.set('limit', query.limit.toString());
    }
    return this.http.get<RecentRequestsResponse>(`${this.API_URL}/recent`, {
      params,
    });
  }
}
