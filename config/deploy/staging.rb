set :application, "shake-webservice"
set :deploy_to, "/var/www/#{fetch(:application)}"
set :repo_url, "git@github.com-shake_webservice:aasatech/shake-webservice.git"

server "159.65.11.27", user: "deployer", roles: %w{app db web}

namespace :deploy do
  task :build_dist do
    on roles :all do
      within release_path do
        execute "cd #{release_path} && #{fetch(:nvm_prefix)} yarn build && #{fetch(:nvm_prefix)} yarn migrate && #{fetch(:nvm_prefix)} yarn symlink:storage"
      end
    end
  end

  task :restart do
    on roles :all do
      within current_path do
        execute "cd #{current_path} && #{fetch(:nvm_prefix)} pm2 startOrRestart app.json"
      end
    end
  end

  before 'deploy:publishing', :build_dist
  after 'deploy:publishing', :restart
end