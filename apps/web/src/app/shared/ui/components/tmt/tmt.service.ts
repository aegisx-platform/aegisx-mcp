import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  TmtConcept,
  TmtHierarchy,
  RelatedDrug,
  TmtStats,
  TmtLevel,
} from './tmt.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
}

@Injectable({ providedIn: 'root' })
export class TmtService {
  private http = inject(HttpClient);
  private baseUrl = '/inventory/tmt';

  // Cache for concepts (by code)
  private conceptCache = new Map<
    string,
    { data: TmtConcept; timestamp: number }
  >();
  private hierarchyCache = new Map<
    number,
    { data: TmtHierarchy; timestamp: number }
  >();

  // Cache TTL in milliseconds
  private readonly CONCEPT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly HIERARCHY_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  /**
   * Search TMT concepts
   */
  search(
    query: string,
    options?: {
      level?: TmtLevel | TmtLevel[];
      limit?: number;
      includeInactive?: boolean;
    },
  ): Observable<TmtConcept[]> {
    const params: Record<string, string> = { q: query };

    if (options?.level) {
      params['level'] = Array.isArray(options.level)
        ? options.level.join(',')
        : options.level;
    }
    if (options?.limit) {
      params['limit'] = options.limit.toString();
    }
    if (options?.includeInactive) {
      params['includeInactive'] = 'true';
    }

    return this.http
      .get<
        ApiResponse<TmtConcept[]>
      >(`${this.baseUrl}/concepts/search`, { params })
      .pipe(map((res) => res.data));
  }

  /**
   * Get concept by ID
   */
  getById(id: number): Observable<TmtConcept | null> {
    return this.http
      .get<ApiResponse<TmtConcept>>(`${this.baseUrl}/concepts/${id}`)
      .pipe(
        map((res) => res.data),
        catchError(() => of(null)),
      );
  }

  /**
   * Get concept by code (with caching)
   */
  getByCode(code: string): Observable<TmtConcept | null> {
    // Check cache
    const cached = this.conceptCache.get(code);
    if (cached && Date.now() - cached.timestamp < this.CONCEPT_CACHE_TTL) {
      return of(cached.data);
    }

    return this.http
      .get<ApiResponse<TmtConcept>>(`${this.baseUrl}/concepts/code/${code}`)
      .pipe(
        map((res) => {
          // Update cache
          this.conceptCache.set(code, {
            data: res.data,
            timestamp: Date.now(),
          });
          return res.data;
        }),
        catchError(() => of(null)),
      );
  }

  /**
   * Get concept by TMT ID
   */
  getByTmtId(tmtId: number): Observable<TmtConcept | null> {
    return this.http
      .get<ApiResponse<TmtConcept>>(`${this.baseUrl}/concepts/tmt-id/${tmtId}`)
      .pipe(
        map((res) => res.data),
        catchError(() => of(null)),
      );
  }

  /**
   * Get hierarchy for concept (with caching)
   */
  getHierarchy(
    id: number,
    options?: {
      maxDepth?: number;
      includeInactive?: boolean;
    },
  ): Observable<TmtHierarchy | null> {
    // Check cache (only if no special options)
    if (!options?.includeInactive) {
      const cached = this.hierarchyCache.get(id);
      if (cached && Date.now() - cached.timestamp < this.HIERARCHY_CACHE_TTL) {
        return of(cached.data);
      }
    }

    const params: Record<string, string> = {};
    if (options?.maxDepth) {
      params['maxDepth'] = options.maxDepth.toString();
    }
    if (options?.includeInactive) {
      params['includeInactive'] = 'true';
    }

    return this.http
      .get<
        ApiResponse<TmtHierarchy>
      >(`${this.baseUrl}/concepts/${id}/hierarchy`, { params })
      .pipe(
        map((res) => {
          // Update cache
          if (!options?.includeInactive) {
            this.hierarchyCache.set(id, {
              data: res.data,
              timestamp: Date.now(),
            });
          }
          return res.data;
        }),
        catchError(() => of(null)),
      );
  }

  /**
   * Get related drugs in system
   */
  getRelatedDrugs(tmtId: number): Observable<RelatedDrug[]> {
    return this.http
      .get<
        ApiResponse<RelatedDrug[]>
      >(`${this.baseUrl}/concepts/${tmtId}/related-drugs`)
      .pipe(
        map((res) => res.data),
        catchError(() => of([])),
      );
  }

  /**
   * Get TMT statistics
   */
  getStats(): Observable<TmtStats | null> {
    return this.http.get<ApiResponse<TmtStats>>(`${this.baseUrl}/stats`).pipe(
      map((res) => res.data),
      shareReplay(1),
      catchError(() => of(null)),
    );
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.conceptCache.clear();
    this.hierarchyCache.clear();
  }

  /**
   * Clear concept cache for specific code
   */
  clearConceptCache(code: string): void {
    this.conceptCache.delete(code);
  }

  /**
   * Clear hierarchy cache for specific ID
   */
  clearHierarchyCache(id: number): void {
    this.hierarchyCache.delete(id);
  }
}
