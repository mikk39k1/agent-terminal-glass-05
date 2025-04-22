
export interface Project {
  id: string;
  name: string;
  description: string;
  github_repo: string | null;
  github_owner: string | null;
}

export interface Chat {
  id: string;
  title: string;
  created_at: string;
}
